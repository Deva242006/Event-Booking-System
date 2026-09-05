package com.example.eventbooking.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendTicketEmail(String toEmail, String subject, String ticketDetails, String qrCodeBase64) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject(subject);
            
            // Basic HTML content
            String htmlContent = "<h3>Your Event Booking is Confirmed!</h3>"
                    + "<p>Here are your ticket details:</p>"
                    + "<pre>" + ticketDetails + "</pre>"
                    + "<p>Please present the QR code below at the event:</p>"
                    + "<img src='" + qrCodeBase64 + "' alt='Ticket QR Code'/>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}
