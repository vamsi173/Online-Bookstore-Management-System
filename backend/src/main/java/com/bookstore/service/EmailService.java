package com.bookstore.service;

import com.bookstore.model.Order;
import com.bookstore.model.OrderItem;
import com.bookstore.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.SendFailedException;
import jakarta.mail.internet.MimeMessage;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private SpringTemplateEngine templateEngine;
    
    @Value("${spring.mail.username:officialvamsi77@gmail.com}")
    private String emailHostUser;

    public void sendOrderConfirmationEmail(User user, Order order, List<OrderItem> orderItems) {
        try {
            System.out.println("Attempting to send order confirmation email to: " + user.getEmail() + ", Order ID: " + order.getOrderId());
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("Order Confirmation - Order #" + order.getOrderId());
            
            // Add from address (using the configured sender address)
            String fromAddress = emailHostUser;
            helper.setFrom(fromAddress);
            // Also set the reply-to address to the same
            helper.setReplyTo(fromAddress);
            
            // Add headers to improve deliverability and avoid spam filters
            message.addHeader("X-Mailer", "BookStore Application");
            message.addHeader("X-Priority", "1");
            message.addHeader("Importance", "high");
            message.addHeader("X-MSMail-Priority", "High");
            message.addHeader("Precedence", "bulk");

            // Prepare template context
            Context context = new Context();
            Map<String, Object> model = new HashMap<>();
            model.put("user", user);
            model.put("order", order);
            model.put("orderItems", orderItems);
            model.put("totalAmount", order.getTotalAmount());
            model.put("orderDate", order.getCreatedAt());
            model.put("orderId", order.getOrderId());
            context.setVariables(model);

            // Process the template
            String htmlContent = templateEngine.process("order-confirmation", context);
            helper.setText(htmlContent, true);

            System.out.println("About to send email to: " + user.getEmail() + " from: " + fromAddress);
            
            // Add additional logging before sending
            System.out.println("SMTP Host: smtp.gmail.com");
            System.out.println("SMTP Port: 587");
            System.out.println("Username: " + emailHostUser);
            System.out.println("Sending email now...");
            
            // Log more detailed information for debugging
            System.out.println("Recipient: " + user.getEmail());
            System.out.println("Subject: Order Confirmation - Order #" + order.getOrderId());
            System.out.println("Order ID: " + order.getOrderId());
            System.out.println("Order Total: $" + order.getTotalAmount());
            
            // Attempt to send the email and capture the transport response
            System.out.println("About to send email to: " + user.getEmail() + " via SendGrid");
            mailSender.send(message);
            System.out.println("Order confirmation email submitted to SendGrid for delivery to: " + user.getEmail());
            System.out.println("Email delivery status: Message handed off to SendGrid service");
            
            // Note: This does not guarantee delivery, just submission to SendGrid
            System.out.println("NOTE: Email submitted to SendGrid. Check SendGrid dashboard for final delivery status.");
        } catch (SendFailedException e) {
            System.err.println("SendFailedException while sending order confirmation email: " + e.getMessage());
            System.err.println("Failed addresses: " + java.util.Arrays.toString(e.getValidUnsentAddresses()));
            System.err.println("Invalid addresses: " + java.util.Arrays.toString(e.getInvalidAddresses()));
            System.err.println("Valid unsend addresses: " + java.util.Arrays.toString(e.getValidUnsentAddresses()));
            e.printStackTrace();
            
            // Log the failure for monitoring
            System.err.println("EMAIL DELIVERY FAILURE: Email failed to reach recipient: " + user.getEmail());
        } catch (MessagingException e) {
            System.err.println("MessagingException while sending order confirmation email: " + e.getMessage());
            e.printStackTrace();
            
            // More specific error handling
            String errorMessage = e.getMessage().toLowerCase();
            if (errorMessage.contains("401") || 
                errorMessage.contains("authentication") ||
                errorMessage.contains("auth") ||
                errorMessage.contains("invalid") ||
                errorMessage.contains("wrong")) {
                System.err.println("SENDGRID AUTHENTICATION FAILED: Invalid API key or authentication error.");
                System.err.println("Please verify your SendGrid API key is correct and has proper permissions.");
            } else if (errorMessage.contains("credits exceeded") || 
                      errorMessage.contains("maximum credits") ||
                      errorMessage.contains("451") ||
                      errorMessage.contains("rate limit")) {
                System.err.println("SENDGRID USAGE LIMIT EXCEEDED: Your SendGrid account has exceeded its allocated credits.");
                System.err.println("Please upgrade your SendGrid plan or use a different API key with available credits.");
            } else if (errorMessage.contains("spam") || 
                      errorMessage.contains("blocked") ||
                      errorMessage.contains("policy") ||
                      errorMessage.contains("relay")) {
                System.err.println("EMAIL BLOCKED BY PROVIDER: Your email was likely blocked by spam filters.");
                System.err.println("Check recipient's email settings and your SendGrid reputation settings.");
            }
            
            // Log the failure for monitoring
            System.err.println("EMAIL DELIVERY FAILURE: Email failed to reach recipient: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("General exception while sending order confirmation email: " + e.getMessage());
            e.printStackTrace();
            
            // Check for common connection issues
            String errorMessage = e.getMessage();
            if (errorMessage.toLowerCase().contains("connection") || 
                errorMessage.toLowerCase().contains("timeout") || 
                errorMessage.contains("535")) {  // 535 is authentication error code
                System.err.println("CONNECTION/AUTHENTICATION ISSUE: Problem connecting to SMTP server.");
                System.err.println("Check your network connection and Gmail SMTP settings.");
                System.err.println("Ensure your Gmail account allows less secure apps or uses App Passwords.");
            }
            
            // Log the failure for monitoring
            System.err.println("EMAIL DELIVERY FAILURE: Email failed to reach recipient: " + user.getEmail());
        }
    }
    
    public void sendOrderConfirmationEmailToSpecificAddress(User user, Order order, List<OrderItem> orderItems, String emailAddress) {
        try {
            System.out.println("Attempting to send order confirmation email to: " + emailAddress + ", Order ID: " + order.getOrderId());
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(emailAddress);  // Use the specific email address provided
            helper.setSubject("Order Confirmation - Order #" + order.getOrderId());
            
            // Add from address (using the configured sender address)
            String fromAddress = emailHostUser;
            helper.setFrom(fromAddress);
            // Also set the reply-to address to the same
            helper.setReplyTo(fromAddress);
            
            // Add headers to improve deliverability and avoid spam filters
            message.addHeader("X-Mailer", "BookStore Application");
            message.addHeader("X-Priority", "1");
            message.addHeader("Importance", "high");
            message.addHeader("X-MSMail-Priority", "High");
            message.addHeader("Precedence", "bulk");

            // Prepare template context
            Context context = new Context();
            Map<String, Object> model = new HashMap<>();
            model.put("user", user);
            model.put("order", order);
            model.put("orderItems", orderItems);
            model.put("totalAmount", order.getTotalAmount());
            model.put("orderDate", order.getCreatedAt());
            model.put("orderId", order.getOrderId());
            context.setVariables(model);

            // Process the template
            String htmlContent = templateEngine.process("order-confirmation", context);
            helper.setText(htmlContent, true);

            System.out.println("About to send email to: " + emailAddress + " from: " + fromAddress);
            
            // Add additional logging before sending
            System.out.println("SMTP Host: smtp.gmail.com");
            System.out.println("SMTP Port: 587");
            System.out.println("Username: " + emailHostUser);
            System.out.println("Sending email now...");
            
            // Log more detailed information for debugging
            System.out.println("Recipient: " + emailAddress);
            System.out.println("Subject: Order Confirmation - Order #" + order.getOrderId());
            System.out.println("Order ID: " + order.getOrderId());
            System.out.println("Order Total: $" + order.getTotalAmount());
            
            // Attempt to send the email and capture the transport response
            System.out.println("About to send email to: " + emailAddress + " via SendGrid");
            mailSender.send(message);
            System.out.println("Order confirmation email submitted to SendGrid for delivery to: " + emailAddress);
            System.out.println("Email delivery status: Message handed off to SendGrid service");
            
            // Note: This does not guarantee delivery, just submission to SendGrid
            System.out.println("NOTE: Email submitted to SendGrid. Check SendGrid dashboard for final delivery status.");
        } catch (SendFailedException e) {
            System.err.println("SendFailedException while sending order confirmation email: " + e.getMessage());
            System.err.println("Failed addresses: " + java.util.Arrays.toString(e.getValidUnsentAddresses()));
            System.err.println("Invalid addresses: " + java.util.Arrays.toString(e.getInvalidAddresses()));
            System.err.println("Valid unsend addresses: " + java.util.Arrays.toString(e.getValidUnsentAddresses()));
            e.printStackTrace();
            
            // Log the failure for monitoring
            System.err.println("EMAIL DELIVERY FAILURE: Email failed to reach recipient: " + emailAddress);
        } catch (MessagingException e) {
            System.err.println("MessagingException while sending order confirmation email: " + e.getMessage());
            e.printStackTrace();
            
            // More specific error handling
            String errorMessage = e.getMessage().toLowerCase();
            if (errorMessage.contains("401") || 
                errorMessage.contains("authentication") ||
                errorMessage.contains("auth") ||
                errorMessage.contains("invalid") ||
                errorMessage.contains("wrong")) {
                System.err.println("SENDGRID AUTHENTICATION FAILED: Invalid API key or authentication error.");
                System.err.println("Please verify your SendGrid API key is correct and has proper permissions.");
            } else if (errorMessage.contains("credits exceeded") || 
                      errorMessage.contains("maximum credits") ||
                      errorMessage.contains("451") ||
                      errorMessage.contains("rate limit")) {
                System.err.println("SENDGRID USAGE LIMIT EXCEEDED: Your SendGrid account has exceeded its allocated credits.");
                System.err.println("Please upgrade your SendGrid plan or use a different API key with available credits.");
            } else if (errorMessage.contains("spam") || 
                      errorMessage.contains("blocked") ||
                      errorMessage.contains("policy") ||
                      errorMessage.contains("relay")) {
                System.err.println("EMAIL BLOCKED BY PROVIDER: Your email was likely blocked by spam filters.");
                System.err.println("Check recipient's email settings and your SendGrid reputation settings.");
            }
            
            // Log the failure for monitoring
            System.err.println("EMAIL DELIVERY FAILURE: Email failed to reach recipient: " + emailAddress);
        } catch (Exception e) {
            System.err.println("General exception while sending order confirmation email: " + e.getMessage());
            e.printStackTrace();
            
            // Check for common connection issues
            String errorMessage = e.getMessage();
            if (errorMessage.toLowerCase().contains("connection") || 
                errorMessage.toLowerCase().contains("timeout") || 
                errorMessage.contains("535")) {  // 535 is authentication error code
                System.err.println("CONNECTION/AUTHENTICATION ISSUE: Problem connecting to SMTP server.");
                System.err.println("Check your network connection and Gmail SMTP settings.");
                System.err.println("Ensure your Gmail account allows less secure apps or uses App Passwords.");
            }
            
            // Log the failure for monitoring
            System.err.println("EMAIL DELIVERY FAILURE: Email failed to reach recipient: " + emailAddress);
        }
    }
    
    public void sendOrderConfirmationEmailToBoth(User user, Order order, List<OrderItem> orderItems, String shippingEmail) {
        System.out.println("Starting dual email delivery process...");
        boolean userEmailSuccess = false;
        boolean shippingEmailSuccess = false;
        
        // Send to the user's registered email
        try {
            sendOrderConfirmationEmail(user, order, orderItems);
            userEmailSuccess = true;
            System.out.println("User email sent successfully to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Failed to send user email to: " + user.getEmail() + ", Error: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Send to the shipping address email if it's different
        if (shippingEmail != null && !shippingEmail.equals(user.getEmail())) {
            try {
                sendOrderConfirmationEmailToSpecificAddress(user, order, orderItems, shippingEmail);
                shippingEmailSuccess = true;
                System.out.println("Shipping email sent successfully to: " + shippingEmail);
            } catch (Exception e) {
                System.err.println("Failed to send shipping email to: " + shippingEmail + ", Error: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            // If shipping email is same as user email, mark as successful
            shippingEmailSuccess = userEmailSuccess;
            System.out.println("Shipping email same as user email, skipping duplicate send");
        }
        
        // Log overall status
        if (userEmailSuccess && shippingEmailSuccess) {
            System.out.println("SUCCESS: Both emails delivered successfully");
        } else if (userEmailSuccess || shippingEmailSuccess) {
            System.out.println("PARTIAL SUCCESS: At least one email delivered");
        } else {
            System.err.println("FAILURE: No emails were delivered successfully");
        }
    }
}