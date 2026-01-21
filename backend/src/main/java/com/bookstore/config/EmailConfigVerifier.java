package com.bookstore.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class EmailConfigVerifier {

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${spring.mail.username:#{null}}")
    private String mailUsername;

    @Value("${spring.mail.password:#{null}}")
    private String mailPassword;

    @PostConstruct
    public void verifyEmailConfiguration() {
        System.out.println("=========================================");
        System.out.println("EMAIL CONFIGURATION VERIFICATION");
        System.out.println("=========================================");
        System.out.println("Mail Host: " + mailHost);
        System.out.println("Mail Port: " + mailPort);
        System.out.println("Mail Username: " + (mailUsername != null ? mailUsername : "NOT SET"));
        System.out.println("Mail Password: " + (mailPassword != null ? "SET (" + mailPassword.length() + " chars)" : "NOT SET"));

        // Basic validation
        if (mailUsername == null || mailUsername.trim().isEmpty()) {
            System.err.println("WARNING: Mail username is not configured!");
        }

        if (mailPassword == null || mailPassword.trim().isEmpty()) {
            System.err.println("WARNING: Mail password is not configured!");
        } else if ("YOUR_SENDGRID_API_KEY_HERE".equals(mailPassword)) {
            System.err.println("WARNING: Using placeholder API key. Please update with your actual SendGrid API key!");
        }

        // Check if using Gmail vs SendGrid
        if (mailHost.contains("gmail")) {
            System.out.println("INFO: Using Gmail SMTP - consider switching to a dedicated email service for better reliability");
            if (mailPassword.length() != 16) {
                System.out.println("INFO: Gmail App Passwords should typically be 16 characters (without spaces)");
                System.out.println("Current password length: " + mailPassword.length());
            }
        } else if (mailHost.contains("sendgrid")) {
            System.out.println("INFO: Using SendGrid SMTP - recommended for transactional emails");
            System.out.println("WARNING: If experiencing 'Maximum credits exceeded' errors, upgrade your SendGrid plan");
        }

        System.out.println("=========================================");
        System.out.println("Email configuration verification complete");
        System.out.println("=========================================");
    }

    private boolean isValidEmail(String email) {
        return email != null && email.contains("@") && email.contains(".");
    }
}