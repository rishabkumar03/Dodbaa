export const artistRejectedEmail = (artistName: string, rejectionInReason: string): string => {
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
                    .container { background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto; }
                    .header { color: #e85d04; font-size: 24px; font-weight: bold; }
                    .message { color: #333; font-size: 16px; line-height: 1.6; }
                    .button { background: #e85d04; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 20px; }
                    .footer { color: #999; font-size: 12px; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <p class="header"> Thankyou for applying ${artistName}!</p>
                    <p class="message">
                        Your artist application has been rejected. Please try to refine your art and apply next time.
                        ${rejectionInReason}
                    </p>
                    <a class="button" href="https://dodbaa.com/profile">
                        Go to your account profile
                    </a>
                    <p class="footer">
                        2026 Dodbaa. All right reserved.
                    </p>
                </div>
            </body>
        </html>
    `           
}