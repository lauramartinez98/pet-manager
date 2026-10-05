package com.petmanager.backend.services;

import com.petmanager.backend.events.UserRegisteredEvent;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.util.HtmlUtils;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class WelcomeEmailService {

    private final JavaMailSender mailSender;
    private final String from;
    private final String frontendUrl;

    public WelcomeEmailService(JavaMailSender mailSender,
                               @Value("${spring.mail.username}") String from,
                               @Value("${app.frontend-url}") String frontendUrl) {
        this.mailSender = mailSender;
        this.from = from;
        this.frontendUrl = frontendUrl;
    }

    /**
     * AFTER_COMMIT: solo se envía si la cuenta se guardó de verdad.
     * Async: el registro responde sin esperar al servidor SMTP. Un fallo de correo no afecta al usuario.
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onUserRegistered(UserRegisteredEvent event) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(from, "Pet Manager");
            helper.setTo(event.email());
            helper.setSubject("¡Bienvenido/a a Pet Manager! 🐾");
            helper.setText(plainText(event.fullName()), html(event.fullName()));
            mailSender.send(message);
            log.info("Correo de bienvenida enviado a {}", event.email());
        } catch (MailException | MessagingException | UnsupportedEncodingException e) {
            log.warn("No se pudo enviar el correo de bienvenida a {}: {}", event.email(), e.getMessage());
        }
    }

    private static String firstName(String fullName) {
        return fullName.trim().split("\\s+")[0];
    }

    private String plainText(String fullName) {
        return """
                ¡Hola, %s!

                Gracias por unirte a Pet Manager. Desde hoy puedes llevar en un solo sitio los paseos, \
                las citas veterinarias y los gastos de tus mascotas.

                Empieza añadiendo a tu primer miembro: %s

                ¡Nos vemos pronto!
                El equipo de Pet Manager
                """.formatted(firstName(fullName), frontendUrl);
    }

    // HTML con estilos en línea (los clientes de correo ignoran <style>) y la paleta de ui-guidelines
    private String html(String fullName) {
        String name = HtmlUtils.htmlEscape(firstName(fullName));
        String url = HtmlUtils.htmlEscape(frontendUrl);
        return """
                <!doctype html>
                <html lang="es">
                <body style="margin:0;padding:0;background:#fffaea;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#5c3d2e;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#fffaea;padding:32px 16px;">
                    <tr><td align="center">
                      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:520px;">
                        <tr><td align="center" style="padding-bottom:16px;">
                          <div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%%;background:#bcd6ec;font-size:30px;text-align:center;">🐾</div>
                          <p style="margin:8px 0 0;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#8a6f62;">Pet Manager</p>
                        </td></tr>
                        <tr><td style="background:#fdf1c7;border-radius:24px;padding:32px;box-shadow:0 4px 12px rgba(92,61,46,0.10);">
                          <h1 style="margin:0 0 12px;font-size:24px;color:#5c3d2e;">¡Hola, %s!</h1>
                          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
                            Gracias por unirte a <strong>Pet Manager</strong>. Desde hoy puedes llevar en un solo sitio:
                          </p>
                          <ul style="margin:0 0 24px;padding-left:20px;font-size:15px;line-height:1.8;">
                            <li>🦮 Los <strong>paseos</strong> diarios</li>
                            <li>🩺 Las <strong>citas veterinarias</strong></li>
                            <li>💶 Los <strong>gastos</strong> de cada mascota</li>
                          </ul>
                          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:12px;background:#5c3d2e;">
                            <a href="%s" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#fffaea;text-decoration:none;">+ Añadir mi primera mascota</a>
                          </td></tr></table>
                        </td></tr>
                        <tr><td align="center" style="padding-top:20px;font-size:12px;color:#8a6f62;">
                          Recibes este correo porque acabas de crear una cuenta en Pet Manager.
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(name, url);
    }
}
