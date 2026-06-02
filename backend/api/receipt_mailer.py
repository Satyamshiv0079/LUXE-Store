import os
from datetime import datetime

SPOOL_DIR = os.path.join(os.path.dirname(__file__), "receipts_spool")

def send_receipt(user_email, user_name, order_id, order_details):
    """
    Simulates sending an HTML email by writing it to a local spool directory.
    """
    if not os.path.exists(SPOOL_DIR):
        os.makedirs(SPOOL_DIR)

    # Format the email
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f5f0ea; color: #111; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-top: 4px solid #c9a96e; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <h2 style="text-align: center; font-family: 'Times New Roman', Times, serif; letter-spacing: 2px;">LUXE</h2>
            <h3 style="color: #c9a96e; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Confirmation</h3>
            <p>Dear {user_name},</p>
            <p>Thank you for shopping at LUXE. We have received your order and are currently processing it.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Order ID:</strong> {order_id}</p>
                <p><strong>Status:</strong> Processing</p>
            </div>
            
            <h4>Order Details:</h4>
            <ul>
    """
    
    if "cart" in order_details:
        for item in order_details["cart"]:
            html_content += f"""
                <li style="margin-bottom: 10px;">
                    <strong>{item.get('name', 'Product')}</strong> x {item.get('qty', 1)} <br>
                    <span style="color: #666; font-size: 0.9em;">Size: {item.get('size', 'N/A')}</span>
                </li>
            """
            
    html_content += f"""
            </ul>
            <p style="margin-top: 20px; font-weight: bold;">Subtotal: {order_details.get('subtotal', 0)}</p>
            <p>We will notify you once your order has shipped.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="text-align: center; font-size: 0.8em; color: #999;">LUXE — Where Desire Meets Design</p>
        </div>
    </body>
    </html>
    """
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"receipt_{order_id}_{timestamp}.html"
    filepath = os.path.join(SPOOL_DIR, filename)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html_content)
        
    print(f"[*] Simulated receipt email sent to {user_email}. Spooled to {filepath}")
    return True
