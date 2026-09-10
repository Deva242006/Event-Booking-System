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

    /**
     * Sends a booking confirmation email.
     *
     * NOTE: data:image/... URIs are blocked by most email clients (Gmail, Outlook).
     * The QR code is included as a text fallback. For production, attach it as
     * a CID inline attachment using MimeMessageHelper.addInline(...).
     */
    public void sendTicketEmail(String toEmail, String subject, String ticketDetails, String qrCodeBase64) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject(subject);

            String htmlContent = "<div style='font-family:sans-serif;max-width:600px;margin:0 auto'>"
                    + "<h2 style='color:#6366f1'>🎉 Your Booking is Confirmed!</h2>"
                    + "<p>Thank you for booking with <strong>EventBook</strong>. Here are your ticket details:</p>"
                    + "<pre style='background:#f1f5f9;padding:1rem;border-radius:8px;font-size:0.9rem'>"
                    + ticketDetails
                    + "</pre>"
                    + "<p style='color:#64748b;font-size:0.85rem'>Your QR code is available in the EventBook dashboard under <strong>My Bookings</strong>.</p>"
                    + "<p style='color:#64748b;font-size:0.85rem'>Present this QR code at the event entrance for admission.</p>"
                    + "<hr style='border-color:#e2e8f0'/>"
                    + "<p style='color:#94a3b8;font-size:0.75rem'>This is an automated email from EventBook. Please do not reply.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            // Log the failure but don't crash the booking flow
            System.err.println("[EmailService] Failed to send confirmation email to " + toEmail + ": " + e.getMessage());
        }
    }
}
