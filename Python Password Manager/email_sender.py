import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from OTP import generate_8_digit_otp


def send_otp_email(sender_email, app_password, receiver_email):
    """Send an OTP email and return the generated OTP."""
    # Generate the OTP
    otp_code = generate_8_digit_otp()

    # Create the email message
    message = MIMEMultipart("alternative")
    message["Subject"] = "OTP LOGIN"
    message["From"] = sender_email
    message["To"] = receiver_email

    # Plain text version
    text = f"""
    Password Manager Login

    Your One-Time Password (OTP) is: {otp_code}
    This OTP will be valid for 15 minutes.
    """

    # HTML version
    html = f"""\
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Password Manager Login</h2>
        <p>Your OTP for logging into the Password Manager is valid for 15 minutes.</p>
        <h1 style="color: #2b7de9;">{otp_code}</h1>
        <p>Do not share this OTP with anyone.</p>
      </body>
    </html>
    """

    # Attach both plain text and HTML parts
    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))

    # Send the email using Gmail SMTP with SSL encryption
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, app_password)
            server.send_message(message)
        print("Email sent successfully! OTP:", otp_code)
        return otp_code
    except Exception as e:
        print("Error sending email:", e)
        return None
