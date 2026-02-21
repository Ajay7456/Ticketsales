import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import Database from "better-sqlite3";
import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const db = new Database("tickets.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    date TEXT,
    description TEXT,
    venue TEXT,
    hero_image TEXT,
    venue_map TEXT,
    host_name TEXT,
    host_description TEXT,
    host_image TEXT
  );

  CREATE TABLE IF NOT EXISTS ticket_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    quantity INTEGER,
    sold INTEGER DEFAULT 0,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    email TEXT,
    amount REAL,
    status TEXT,
    reference TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    transaction_id TEXT,
    ticket_type_id INTEGER,
    holder_name TEXT,
    email TEXT,
    qr_code TEXT,
    is_used INTEGER DEFAULT 0,
    used_at DATETIME,
    FOREIGN KEY(transaction_id) REFERENCES transactions(id),
    FOREIGN KEY(ticket_type_id) REFERENCES ticket_types(id)
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT,
    caption TEXT,
    category TEXT -- 'guest', 'performance', 'sponsor'
  );
`);

// Seed initial data if empty
const eventCount = db.prepare("SELECT COUNT(*) as count FROM events").get() as { count: number };
if (eventCount.count === 0) {
  db.prepare(`
    INSERT INTO events (title, date, description, venue, hero_image, host_name, host_description, host_image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "Comedy Show 2026",
    "2026-06-15T19:00:00",
    "Get ready for the biggest comedy event of the year! Featuring top comedians from across the globe.",
    "Lagos City Hall",
    "https://picsum.photos/seed/comedy/1200/600",
    "Basketmouth",
    "Bright Okpocha, better known by his stage name Basketmouth, is a Nigerian comedian and actor.",
    "https://picsum.photos/seed/host/400/400"
  );

  db.prepare(`
    INSERT INTO ticket_types (name, price, quantity, description)
    VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)
  `).run(
    "Regular", 5000, 500, "Standard entry to the event.",
    "VIP", 15000, 100, "Premium seating and complimentary drink.",
    "VVIP", 50000, 20, "Front row seating, backstage access, and full hospitality."
  );

  db.prepare(`
    INSERT INTO gallery (image_url, caption, category)
    VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)
  `).run(
    "https://picsum.photos/seed/guest1/400/400", "Guest of Honor: John Smith", "guest",
    "https://picsum.photos/seed/perf1/400/400", "Opening Act: The Laugh Factory", "performance",
    "https://picsum.photos/seed/sponsor1/400/400", "Official Partner: TechCorp", "sponsor"
  );
} else {
  // Ensure columns exist for existing databases
  try { db.prepare("ALTER TABLE events ADD COLUMN host_name TEXT").run(); } catch(e) {}
  try { db.prepare("ALTER TABLE events ADD COLUMN host_description TEXT").run(); } catch(e) {}
  try { db.prepare("ALTER TABLE events ADD COLUMN host_image TEXT").run(); } catch(e) {}
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// --- Email Configuration ---
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendTicketEmail = async (ticket: any, event: any) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials not set. Skipping email.");
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"TIX Ticket Service" <noreply@tix.com>',
    to: ticket.email,
    subject: `Your Ticket for ${event.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981; text-align: center;">TIX. Ticket Confirmation</h2>
        <p>Hi <strong>${ticket.holder_name}</strong>,</p>
        <p>Thank you for your purchase! Your ticket for <strong>${event.title}</strong> is confirmed.</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Event:</strong> ${event.title}</p>
          <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
          <p style="margin: 0 0 10px 0;"><strong>Venue:</strong> ${event.venue}</p>
          <p style="margin: 0 0 10px 0;"><strong>Ticket Type:</strong> ${ticket.ticket_type_name}</p>
          <p style="margin: 0;"><strong>Ticket ID:</strong> <span style="font-family: monospace; background: #eee; padding: 2px 5px; border-radius: 3px;">${ticket.id}</span></p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Scan this QR code at the entrance:</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.id}" alt="Ticket QR Code" style="border: 10px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
        </div>

        <p style="font-size: 12px; color: #999; text-align: center;">
          Please have this email ready on your phone or printed out for entry.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Ticket email sent to ${ticket.email}`);
  } catch (error) {
    console.error("Error sending ticket email:", error);
  }
};

// --- Auth Middleware ---
const authenticateAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// --- Public API Routes ---

app.get("/api/event", (req, res) => {
  const event = db.prepare("SELECT * FROM events LIMIT 1").get();
  res.json(event);
});

app.get("/api/ticket-types", (req, res) => {
  const types = db.prepare("SELECT * FROM ticket_types").all();
  res.json(types);
});

app.get("/api/gallery", (req, res) => {
  const gallery = db.prepare("SELECT * FROM gallery ORDER BY id DESC").all();
  res.json(gallery);
});

app.post("/api/initialize-payment", async (req, res) => {
  const { email, amount, ticket_type_id, holder_name } = req.body;
  
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        metadata: {
          ticket_type_id,
          holder_name,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    const { authorization_url, reference } = response.data.data;

    db.prepare(`
      INSERT INTO transactions (id, email, amount, status, reference)
      VALUES (?, ?, ?, ?, ?)
    `).run(reference, email, amount, "pending", reference);

    res.json({ authorization_url, reference });
  } catch (error: any) {
    console.error("Paystack Init Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to initialize payment" });
  }
});

app.get("/api/verify-payment", async (req, res) => {
  const { reference } = req.query;
  if (!reference) return res.status(400).json({ error: "Reference required" });

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    const data = response.data.data;
    if (data.status === "success") {
      // Update transaction
      db.prepare("UPDATE transactions SET status = 'success' WHERE reference = ?").run(reference);

      // Check if ticket already exists for this reference
      const existingTicket = db.prepare("SELECT * FROM tickets WHERE transaction_id = ?").get(reference);
      
      if (!existingTicket) {
        const ticket_type_id = data.metadata.ticket_type_id;
        const holder_name = data.metadata.holder_name;
        const ticketId = `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Atomic update of sold count and ticket creation
        const transaction = db.transaction(() => {
          db.prepare("UPDATE ticket_types SET sold = sold + 1 WHERE id = ?").run(ticket_type_id);
          db.prepare(`
            INSERT INTO tickets (id, transaction_id, ticket_type_id, holder_name, email, qr_code)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(ticketId, reference, ticket_type_id, holder_name, data.customer.email, ticketId);
        });
        transaction();
        
        // Fetch full ticket details and event for email
        const fullTicket = db.prepare(`
          SELECT t.*, tt.name as ticket_type_name 
          FROM tickets t 
          JOIN ticket_types tt ON t.ticket_type_id = tt.id 
          WHERE t.id = ?
        `).get(ticketId) as any;
        
        const event = db.prepare("SELECT * FROM events WHERE id = 1").get() as any;
        
        // Send email asynchronously
        sendTicketEmail(fullTicket, event).catch(console.error);

        res.json({ status: "success", ticket_id: ticketId });
      } else {
        res.json({ status: "success", ticket_id: (existingTicket as any).id });
      }
    } else {
      res.json({ status: data.status });
    }
  } catch (error: any) {
    console.error("Paystack Verify Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// --- Admin API Routes ---

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

app.get("/api/admin/stats", authenticateAdmin, (req, res) => {
  const totalSold = db.prepare("SELECT SUM(sold) as total FROM ticket_types").get() as any;
  const totalRevenue = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE status = 'success'").get() as any;
  const salesByType = db.prepare("SELECT name, sold, price FROM ticket_types").all();
  
  res.json({
    totalSold: totalSold.total || 0,
    totalRevenue: totalRevenue.total || 0,
    salesByType,
  });
});

app.get("/api/admin/tickets", authenticateAdmin, (req, res) => {
  const tickets = db.prepare(`
    SELECT t.*, tt.name as ticket_type_name, tt.price, tr.created_at as purchase_date
    FROM tickets t
    JOIN ticket_types tt ON t.ticket_type_id = tt.id
    JOIN transactions tr ON t.transaction_id = tr.id
    ORDER BY tr.created_at DESC
  `).all();
  res.json(tickets);
});

app.post("/api/admin/event/update", authenticateAdmin, (req, res) => {
  const { title, date, description, venue, hero_image, host_name, host_description, host_image } = req.body;
  db.prepare(`
    UPDATE events SET title = ?, date = ?, description = ?, venue = ?, hero_image = ?, host_name = ?, host_description = ?, host_image = ?
    WHERE id = 1
  `).run(title, date, description, venue, hero_image, host_name, host_description, host_image);
  res.json({ success: true });
});

app.post("/api/admin/ticket-types/update", authenticateAdmin, (req, res) => {
  const { id, name, price, quantity, description } = req.body;
  db.prepare(`
    UPDATE ticket_types SET name = ?, price = ?, quantity = ?, description = ?
    WHERE id = ?
  `).run(name, price, quantity, description, id);
  res.json({ success: true });
});

app.post("/api/admin/gallery/add", authenticateAdmin, (req, res) => {
  const { image_url, caption, category } = req.body;
  db.prepare(`
    INSERT INTO gallery (image_url, caption, category)
    VALUES (?, ?, ?)
  `).run(image_url, caption, category);
  res.json({ success: true });
});

app.delete("/api/admin/gallery/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM gallery WHERE id = ?").run(id);
  res.json({ success: true });
});

// --- Scanner API ---

app.post("/api/validate-ticket", (req, res) => {
  const { ticket_id, password } = req.body;
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized scanner" });
  }

  const ticket = db.prepare(`
    SELECT t.*, tt.name as ticket_type_name
    FROM tickets t
    JOIN ticket_types tt ON t.ticket_type_id = tt.id
    WHERE t.id = ?
  `).get(ticket_id) as any;

  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  if (ticket.is_used) {
    return res.json({ 
      valid: false, 
      error: "Ticket already used", 
      used_at: ticket.used_at,
      holder_name: ticket.holder_name 
    });
  }

  // Mark as used atomically
  db.prepare("UPDATE tickets SET is_used = 1, used_at = CURRENT_TIMESTAMP WHERE id = ?").run(ticket_id);

  res.json({ 
    valid: true, 
    holder_name: ticket.holder_name, 
    ticket_type: ticket.ticket_type_name 
  });
});

// --- Paystack Webhook ---
app.post("/paystack-webhook", (req, res) => {
  // In a real app, verify Paystack signature here
  const event = req.body;
  if (event.event === "charge.success") {
    const reference = event.data.reference;
    db.prepare("UPDATE transactions SET status = 'success' WHERE reference = ?").run(reference);
    // Logic to generate ticket if not already generated
  }
  res.sendStatus(200);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
