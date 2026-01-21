package com.bookstore.util;

import java.util.Properties;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

/**
 * Utility class to test email delivery separately from the main application
 */
public class EmailTestUtility {

    public static void main(String[] args) {
        System.out.println("Testing email delivery with current configuration...");
        
        // Using the same credentials as configured in application.properties
        String smtpHost = "smtp.gmail.com";
        int smtpPort = 587;
        String username = "officialvamsi77@gmail.com";
        String password = "brqhtyarcvqfevga";  // Gmail App Password
        String recipient = "yerravamsi77@gmail.com";  // Test recipient
        
        // Check if we can establish a connection and send a test email
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", smtpHost);
        props.put("mail.smtp.port", String.valueOf(smtpPort));
        props.put("mail.smtp.ssl.trust", smtpHost);
        props.put("mail.smtp.connectiontimeout", "15000");
        props.put("mail.smtp.timeout", "15000");
        props.put("mail.smtp.writetimeout", "15000");
        
        Session session = Session.getInstance(props,
            new jakarta.mail.Authenticator() {
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(username, password);
                }
            });
        
        try {
            // Create a default MimeMessage object
            Message message = new MimeMessage(session);
            
            // Set From: header field
            message.setFrom(new InternetAddress(username));
            
            // Set To: header field
            message.setRecipients(Message.RecipientType.TO,
                InternetAddress.parse(recipient));
            
            // Set Subject: header field
            message.setSubject("Test Email - BookStore Application");
            
            // Set the actual message
            message.setText("This is a test email to verify that the email configuration is working properly.\n\n"
                          + "If you received this email, your email configuration is correct.\n\n"
                          + "Timestamp: " + new java.util.Date());
            
            // Send message
            Transport.send(message);
            
            System.out.println("Test email sent successfully to: " + recipient);
            System.out.println("Email configuration appears to be working correctly!");
            System.out.println("Note: Even if the email is sent successfully, it may end up in spam/junk folder.");
            System.out.println("For production use, consider using a dedicated email service like SendGrid.");
            
        } catch (MessagingException e) {
            System.err.println("Failed to send test email: " + e.getMessage());
            e.printStackTrace();
            
            System.out.println("\nTroubleshooting tips:");
            System.out.println("1. Verify your Gmail App Password is correct and has no spaces");
            System.out.println("2. Ensure 2-factor authentication is enabled on your Google account");
            System.out.println("3. Check if your IP address is blocked by Gmail");
            System.out.println("4. Confirm you haven't exceeded Gmail's daily sending limits");
            System.out.println("5. Consider using a dedicated email service for transactional emails");
        }
    }
}