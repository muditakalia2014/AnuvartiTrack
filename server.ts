import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("insurance.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sNo INTEGER,
    lastYearIssueDate TEXT,
    name TEXT NOT NULL,
    refContact TEXT,
    email TEXT,
    type TEXT,
    segment TEXT,
    registrationNumber TEXT,
    grossPremium REAL,
    netPremium REAL,
    company TEXT,
    policyNumber TEXT,
    lyCbPercentage REAL,
    expiryDate TEXT,
    targetYear INTEGER,
    targetMonth INTEGER
  );

  CREATE TABLE IF NOT EXISTS follow_ups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerId INTEGER UNIQUE,
    followUpDate TEXT,
    feedback TEXT,
    proposalNumber TEXT,
    newPolicyNumber TEXT,
    chosenCompany TEXT,
    otherCompanyName TEXT,
    grossPremium REAL,
    netPremium REAL,
    rcCollected TEXT DEFAULT 'No',
    panCollected TEXT DEFAULT 'No',
    gstRecorded TEXT DEFAULT 'No',
    status TEXT DEFAULT 'Follow-up Only',
    updatedAt TEXT,
    isExistingOrNew TEXT,
    customerType TEXT,
    referredBy TEXT,
    busType TEXT,
    previousInsuranceCompany TEXT,
    insuranceExpiryDate TEXT,
    usage TEXT,
    permit TEXT,
    seatingCapacity TEXT,
    idvValue REAL,
    manufacturingYear TEXT,
    cbPercentage REAL,
    cbValue REAL,
    finalPaymentAmount REAL,
    coCommissionPercentage REAL,
    commissionAmount REAL,
    profitAmount REAL,
    busWorkingId INTEGER,
    cbStatus TEXT DEFAULT 'Unpaid',
    paymentMode TEXT,
    paymentDate TEXT,
    FOREIGN KEY (customerId) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT -- 'admin' or 'user'
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    username TEXT,
    action TEXT, -- 'login' or 'logout'
    timestamp TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS working_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    username TEXT,
    customerId INTEGER,
    customerName TEXT,
    action TEXT,
    timestamp TEXT,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(customerId) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS bus_working (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT,
    uploadedAt TEXT,
    uploadedBy TEXT
  );

  CREATE TABLE IF NOT EXISTS bus_follow_ups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    busWorkingId INTEGER UNIQUE,
    followUpDate TEXT,
    feedback TEXT,
    proposalNumber TEXT,
    newPolicyNumber TEXT,
    chosenCompany TEXT,
    otherCompanyName TEXT,
    grossPremium REAL,
    netPremium REAL,
    rcCollected TEXT DEFAULT 'No',
    panCollected TEXT DEFAULT 'No',
    gstRecorded TEXT DEFAULT 'No',
    status TEXT DEFAULT 'Follow-up Only',
    updatedAt TEXT,
    cbPercentage REAL,
    cbValue REAL,
    coCommissionPercentage REAL,
    commissionAmount REAL,
    profitAmount REAL,
    cbStatus TEXT DEFAULT 'Unpaid',
    paymentMode TEXT,
    paymentDate TEXT,
    FOREIGN KEY (busWorkingId) REFERENCES bus_working(id)
  );
`);

// Migration for targetYear and targetMonth
try {
  db.prepare("ALTER TABLE customers ADD COLUMN targetYear INTEGER").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE customers ADD COLUMN targetMonth INTEGER").run();
} catch (e) {}

// Migration for follow_ups missing columns
try {
  db.prepare("ALTER TABLE follow_ups ADD COLUMN cbStatus TEXT DEFAULT 'Unpaid'").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE follow_ups ADD COLUMN paymentMode TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE follow_ups ADD COLUMN paymentDate TEXT").run();
} catch (e) {}

// Seed initial users if not exists
const seedUsers = [
  { username: 'muditakalia', password: 'Mk211070#', role: 'admin' },
  { username: 'vedantkalia', password: 'Vvk150599#', role: 'admin' },
  { username: 'indunayyar', password: 'Indu123#', role: 'user' },
  { username: 'navedsolanki', password: 'Naved456#', role: 'user' }
];

const checkUser = db.prepare("SELECT id FROM users LIMIT 1").get();
if (!checkUser) {
  const insertUser = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
  seedUsers.forEach(u => insertUser.run(u.username, u.password, u.role));
  
  // Clear demo data on first run of this version
  db.prepare("DELETE FROM follow_ups").run();
  db.prepare("DELETE FROM customers").run();
  console.log("Demo data cleared for fresh start.");
} else {
  // Update passwords for existing users as requested
  const updateUser = db.prepare("UPDATE users SET password = ? WHERE username = ?");
  seedUsers.forEach(u => updateUser.run(u.password, u.username));
}

// Migration: Ensure columns exist (for existing databases)
try {
  const columns = db.prepare("PRAGMA table_info(follow_ups)").all();
  const hasColumn = (name: string) => columns.some((c: any) => c.name === name);
  
  const newCols = [
    { name: 'newPolicyNumber', type: 'TEXT' },
    { name: 'grossPremium', type: 'REAL' },
    { name: 'netPremium', type: 'REAL' },
    { name: 'isExistingOrNew', type: 'TEXT' },
    { name: 'customerType', type: 'TEXT' },
    { name: 'referredBy', type: 'TEXT' },
    { name: 'busType', type: 'TEXT' },
    { name: 'previousInsuranceCompany', type: 'TEXT' },
    { name: 'insuranceExpiryDate', type: 'TEXT' },
    { name: 'usage', type: 'TEXT' },
    { name: 'permit', type: 'TEXT' },
    { name: 'seatingCapacity', type: 'TEXT' },
    { name: 'idvValue', type: 'REAL' },
    { name: 'manufacturingYear', type: 'TEXT' },
    { name: 'cbPercentage', type: 'REAL' },
    { name: 'cbValue', type: 'REAL' },
    { name: 'finalPaymentAmount', type: 'REAL' },
    { name: 'coCommissionPercentage', type: 'REAL' },
    { name: 'commissionAmount', type: 'REAL' },
    { name: 'profitAmount', type: 'REAL' },
    { name: 'cbStatus', type: 'TEXT' },
    { name: 'paymentMode', type: 'TEXT' },
    { name: 'paymentDate', type: 'TEXT' },
    { name: 'busWorkingId', type: 'INTEGER' }
  ];

  for (const col of newCols) {
    if (!hasColumn(col.name)) {
      db.exec(`ALTER TABLE follow_ups ADD COLUMN ${col.name} ${col.type}`);
      console.log(`Added ${col.name} column to follow_ups`);
    }
  }

  const busFollowUpCols = db.prepare("PRAGMA table_info(bus_follow_ups)").all();
  const hasBusCol = (name: string) => busFollowUpCols.some((c: any) => c.name === name);
  const busCols = [
    { name: 'cbStatus', type: 'TEXT' },
    { name: 'paymentMode', type: 'TEXT' },
    { name: 'paymentDate', type: 'TEXT' }
  ];
  for (const col of busCols) {
    if (!hasBusCol(col.name)) {
      db.exec(`ALTER TABLE bus_follow_ups ADD COLUMN ${col.name} ${col.type}`);
      console.log(`Added ${col.name} column to bus_follow_ups`);
    }
  }

  const customerCols = db.prepare("PRAGMA table_info(customers)").all();
  const hasCustomerCol = (name: string) => customerCols.some((c: any) => c.name === name);
  if (!hasCustomerCol('email')) {
    db.exec(`ALTER TABLE customers ADD COLUMN email TEXT`);
    console.log(`Added email column to customers`);
  }
} catch (e) {
  console.error("Migration error:", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // --- Bus Working Endpoints ---
  app.post("/api/bus-working/upload", (req, res) => {
    const { data, uploadedBy } = req.body;
    const timestamp = new Date().toISOString();

    try {
      // Clear existing data for a fresh "Working Sheet"
      db.prepare("DELETE FROM bus_follow_ups").run();
      db.prepare("DELETE FROM bus_working").run();

      const insert = db.prepare("INSERT INTO bus_working (data, uploadedAt, uploadedBy) VALUES (?, ?, ?)");
      const insertMany = db.transaction((rows) => {
        for (const row of rows) {
          insert.run(JSON.stringify(row), timestamp, uploadedBy);
        }
      });

      insertMany(data);
      res.json({ success: true, count: data.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/bus-working", (req, res) => {
    try {
      const rows = db.prepare(`
        SELECT bw.*, bf.status, bf.followUpDate, bf.feedback, bf.proposalNumber, bf.newPolicyNumber,
               bf.chosenCompany, bf.otherCompanyName, bf.grossPremium as currentGrossPremium, 
               bf.netPremium as currentNetPremium, 
               bf.rcCollected, bf.panCollected, bf.gstRecorded,
               bf.cbPercentage, bf.cbValue, bf.coCommissionPercentage,
               bf.commissionAmount, bf.profitAmount,
               bf.cbStatus, bf.paymentMode, bf.paymentDate
        FROM bus_working bw
        LEFT JOIN bus_follow_ups bf ON bw.id = bf.busWorkingId
        ORDER BY bw.id ASC
      `).all();
      const data = rows.map((r: any) => ({
        ...JSON.parse(r.data),
        _id: r.id,
        _uploadedAt: r.uploadedAt,
        _uploadedBy: r.uploadedBy,
        status: r.status,
        followUpDate: r.followUpDate,
        feedback: r.feedback,
        proposalNumber: r.proposalNumber,
        newPolicyNumber: r.newPolicyNumber,
        chosenCompany: r.chosenCompany,
        otherCompanyName: r.otherCompanyName,
        currentGrossPremium: r.currentGrossPremium,
        currentNetPremium: r.currentNetPremium,
        rcCollected: r.rcCollected,
        panCollected: r.panCollected,
        gstRecorded: r.gstRecorded,
        cbPercentage: r.cbPercentage,
        cbValue: r.cbValue,
        coCommissionPercentage: r.coCommissionPercentage,
        commissionAmount: r.commissionAmount,
        profitAmount: r.profitAmount
      }));
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/bus-working/followup", (req, res) => {
    try {
      const { busWorkingId, userId, username, ...data } = req.body;
      const updatedAt = new Date().toISOString();

      const exists = db.prepare("SELECT id FROM bus_follow_ups WHERE busWorkingId = ?").get(busWorkingId);

      if (exists) {
        const update = db.prepare(`
          UPDATE bus_follow_ups SET 
            followUpDate = ?, feedback = ?, proposalNumber = ?, newPolicyNumber = ?,
            chosenCompany = ?, otherCompanyName = ?, grossPremium = ?, netPremium = ?, 
            rcCollected = ?, panCollected = ?, gstRecorded = ?, 
            status = ?, updatedAt = ?,
            cbPercentage = ?, cbValue = ?, coCommissionPercentage = ?,
            commissionAmount = ?, profitAmount = ?,
            cbStatus = ?, paymentMode = ?, paymentDate = ?
          WHERE busWorkingId = ?
        `);
        update.run(
          data.followUpDate, data.feedback, data.proposalNumber, data.newPolicyNumber,
          data.chosenCompany, data.otherCompanyName, data.grossPremium, data.netPremium,
          data.rcCollected, data.panCollected, data.gstRecorded,
          data.status, updatedAt,
          data.cbPercentage, data.cbValue, data.coCommissionPercentage,
          data.commissionAmount, data.profitAmount,
          data.cbStatus || 'Unpaid', data.paymentMode || '', data.paymentDate || '',
          busWorkingId
        );
      } else {
        const insert = db.prepare(`
          INSERT INTO bus_follow_ups (
            busWorkingId, followUpDate, feedback, proposalNumber, newPolicyNumber,
            chosenCompany, otherCompanyName, grossPremium, netPremium, 
            rcCollected, panCollected, gstRecorded, status, updatedAt,
            cbPercentage, cbValue, coCommissionPercentage,
            commissionAmount, profitAmount,
            cbStatus, paymentMode, paymentDate
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insert.run(
          busWorkingId, data.followUpDate, data.feedback, data.proposalNumber, data.newPolicyNumber,
          data.chosenCompany, data.otherCompanyName, data.grossPremium, data.netPremium,
          data.rcCollected, data.panCollected, data.gstRecorded,
          data.status, updatedAt,
          data.cbPercentage, data.cbValue, data.coCommissionPercentage,
          data.commissionAmount, data.profitAmount,
          data.cbStatus || 'Unpaid', data.paymentMode || '', data.paymentDate || ''
        );
      }

      // Log working data
      if (userId && username) {
        db.prepare("INSERT INTO working_logs (userId, username, customerId, customerName, action, timestamp) VALUES (?, ?, ?, ?, ?, ?)")
          .run(userId, username, null, "Bus Working Row", `Updated Bus Follow-up (${data.status})`, updatedAt);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Bus Follow-up error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Auth Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
    
    if (user) {
      const timestamp = new Date().toISOString();
      db.prepare("INSERT INTO logs (userId, username, action, timestamp) VALUES (?, ?, ?, ?)").run(user.id, user.username, 'login', timestamp);
      res.json({ id: user.id, username: user.username, role: user.role });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/logout", (req, res) => {
    const { userId, username } = req.body;
    const timestamp = new Date().toISOString();
    db.prepare("INSERT INTO logs (userId, username, action, timestamp) VALUES (?, ?, ?, ?)").run(userId, username, 'logout', timestamp);
    res.json({ success: true });
  });

  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT id, username, role FROM users").all();
    res.json(users);
  });

  app.post("/api/users/reset-password", (req, res) => {
    const { userId, newPassword } = req.body;
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(newPassword, userId);
    res.json({ success: true });
  });

  app.get("/api/logs", (req, res) => {
    const logs = db.prepare("SELECT * FROM logs ORDER BY timestamp DESC").all();
    res.json(logs);
  });

  app.get("/api/working-logs", (req, res) => {
    const logs = db.prepare("SELECT * FROM working_logs ORDER BY timestamp DESC").all();
    res.json(logs);
  });

  // API Routes
  app.post("/api/upload", (req, res) => {
    const { data: customers, year, month } = req.body;
    
    if (!year || !month) {
      return res.status(400).json({ error: "Year and month are required" });
    }

    const deleteFollowUps = db.prepare(`
      DELETE FROM follow_ups 
      WHERE customerId IN (SELECT id FROM customers WHERE targetYear = ? AND targetMonth = ?)
    `);
    const deleteCustomers = db.prepare("DELETE FROM customers WHERE targetYear = ? AND targetMonth = ?");
    
    const insert = db.prepare(`
      INSERT INTO customers (
        sNo, lastYearIssueDate, name, refContact, email, type, segment, 
        registrationNumber, grossPremium, netPremium, company, 
        policyNumber, lyCbPercentage, expiryDate, targetYear, targetMonth
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const uploadTransaction = db.transaction((data) => {
      console.log(`Starting transaction for ${data.length} customers for ${month}/${year}`);
      deleteFollowUps.run(year, month);
      deleteCustomers.run(year, month);
      let count = 0;
      for (const row of data) {
        insert.run(
          row.sNo, row.lastYearIssueDate, row.name, row.refContact, row.email,
          row.type, row.segment, row.registrationNumber, row.grossPremium, 
          row.netPremium, row.company, row.policyNumber, 
          row.lyCbPercentage, row.expiryDate, year, month
        );
        count++;
      }
      console.log(`Successfully inserted ${count} customers`);
    });

    try {
      uploadTransaction(customers);
      res.json({ success: true, count: customers.length });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/customers", (req, res) => {
    const { year, month } = req.query;
    try {
      let query = `
        SELECT c.*, f.status, f.followUpDate, f.feedback, f.proposalNumber, f.newPolicyNumber,
               f.chosenCompany, f.otherCompanyName, f.grossPremium as currentGrossPremium, 
               f.netPremium as currentNetPremium, 
               f.rcCollected, f.panCollected, f.gstRecorded,
               f.isExistingOrNew, f.customerType, f.referredBy, f.busType,
               f.previousInsuranceCompany, f.insuranceExpiryDate, f.usage, f.permit,
               f.seatingCapacity, f.idvValue, f.manufacturingYear, f.cbPercentage,
               f.cbValue, f.finalPaymentAmount,
               f.coCommissionPercentage, f.commissionAmount, f.profitAmount,
               f.cbStatus, f.paymentMode, f.paymentDate
        FROM customers c
        LEFT JOIN follow_ups f ON c.id = f.customerId
      `;
      
      const params: any[] = [];
      if (year && month) {
        query += " WHERE c.targetYear = ? AND c.targetMonth = ?";
        params.push(year, month);
      }

      const customers = db.prepare(query).all(...params);
      res.json(customers);
    } catch (error) {
      console.error("Fetch customers error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/customers/new", (req, res) => {
    try {
      const { customer, followup, userId, username } = req.body;
      const updatedAt = new Date().toISOString();

      const insertCustomer = db.prepare(`
        INSERT INTO customers (name, refContact, email, segment, registrationNumber, type, targetYear, targetMonth)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const customerResult = insertCustomer.run(
        customer.name, customer.refContact, customer.email || null, customer.segment, 
        customer.registrationNumber, customer.type, customer.targetYear, customer.targetMonth
      );
      
      const customerId = customerResult.lastInsertRowid;

      const insertFollowup = db.prepare(`
        INSERT INTO follow_ups (
          customerId, status, updatedAt, isExistingOrNew, customerType, referredBy,
          busType, previousInsuranceCompany, insuranceExpiryDate, usage, permit,
          seatingCapacity, idvValue, manufacturingYear, grossPremium, netPremium,
          cbPercentage, cbValue, finalPaymentAmount, followUpDate, chosenCompany, otherCompanyName
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertFollowup.run(
        customerId, followup.status || 'Policy Made', updatedAt, followup.isExistingOrNew,
        followup.customerType, followup.referredBy, followup.busType,
        followup.previousInsuranceCompany, followup.insuranceExpiryDate,
        followup.usage, followup.permit, followup.seatingCapacity,
        followup.idvValue, followup.manufacturingYear, followup.grossPremium,
        followup.netPremium, followup.cbPercentage, followup.cbValue,
        followup.finalPaymentAmount, followup.followUpDate || new Date().toISOString().split('T')[0],
        followup.chosenCompany || null, followup.otherCompanyName || null
      );

      // Log working data
      if (userId && username) {
        db.prepare("INSERT INTO working_logs (userId, username, customerId, customerName, action, timestamp) VALUES (?, ?, ?, ?, ?, ?)")
          .run(userId, username, customerId, customer.name, 'Created New Customer', updatedAt);
      }

      res.json({ success: true, customerId });
    } catch (error) {
      console.error("New customer error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/followup", (req, res) => {
    try {
      const { customerId, userId, username, ...data } = req.body;
      const updatedAt = new Date().toISOString();

      const exists = db.prepare("SELECT id FROM follow_ups WHERE customerId = ?").get(customerId);
      const customer = db.prepare("SELECT name FROM customers WHERE id = ?").get(customerId);

      if (exists) {
        const update = db.prepare(`
          UPDATE follow_ups SET 
            followUpDate = ?, feedback = ?, proposalNumber = ?, newPolicyNumber = ?,
            chosenCompany = ?, otherCompanyName = ?, grossPremium = ?, netPremium = ?, 
            rcCollected = ?, panCollected = ?, gstRecorded = ?, 
            status = ?, updatedAt = ?,
            isExistingOrNew = ?, customerType = ?, referredBy = ?, busType = ?,
            previousInsuranceCompany = ?, insuranceExpiryDate = ?, usage = ?, permit = ?,
            seatingCapacity = ?, idvValue = ?, manufacturingYear = ?, cbPercentage = ?,
            cbValue = ?, finalPaymentAmount = ?,
            coCommissionPercentage = ?, commissionAmount = ?, profitAmount = ?,
            cbStatus = ?, paymentMode = ?, paymentDate = ?
          WHERE customerId = ?
        `);
        update.run(
          data.followUpDate, data.feedback, data.proposalNumber, data.newPolicyNumber,
          data.chosenCompany, data.otherCompanyName, data.grossPremium, data.netPremium,
          data.rcCollected, data.panCollected, data.gstRecorded,
          data.status, updatedAt,
          data.isExistingOrNew, data.customerType, data.referredBy, data.busType,
          data.previousInsuranceCompany, data.insuranceExpiryDate, data.usage, data.permit,
          data.seatingCapacity, data.idvValue, data.manufacturingYear, data.cbPercentage,
          data.cbValue, data.finalPaymentAmount,
          data.coCommissionPercentage, data.commissionAmount, data.profitAmount,
          data.cbStatus || 'Unpaid', data.paymentMode || '', data.paymentDate || '',
          customerId
        );
      } else {
        const insert = db.prepare(`
          INSERT INTO follow_ups (
            customerId, followUpDate, feedback, proposalNumber, newPolicyNumber,
            chosenCompany, otherCompanyName, grossPremium, netPremium, 
            rcCollected, panCollected, gstRecorded, status, updatedAt,
            isExistingOrNew, customerType, referredBy, busType,
            previousInsuranceCompany, insuranceExpiryDate, usage, permit,
            seatingCapacity, idvValue, manufacturingYear, cbPercentage,
            cbValue, finalPaymentAmount, coCommissionPercentage,
            commissionAmount, profitAmount, cbStatus, paymentMode, paymentDate
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insert.run(
          customerId, data.followUpDate, data.feedback, data.proposalNumber, data.newPolicyNumber,
          data.chosenCompany, data.otherCompanyName, data.grossPremium, data.netPremium,
          data.rcCollected, data.panCollected, data.gstRecorded,
          data.status, updatedAt,
          data.isExistingOrNew, data.customerType, data.referredBy, data.busType,
          data.previousInsuranceCompany, data.insuranceExpiryDate, data.usage, data.permit,
          data.seatingCapacity, data.idvValue, data.manufacturingYear, data.cbPercentage,
          data.cbValue, data.finalPaymentAmount,
          data.coCommissionPercentage, data.commissionAmount, data.profitAmount,
          data.cbStatus || 'Unpaid', data.paymentMode || '', data.paymentDate || ''
        );
      }

      // Log working data
      if (userId && username && customer) {
        db.prepare("INSERT INTO working_logs (userId, username, customerId, customerName, action, timestamp) VALUES (?, ?, ?, ?, ?, ?)")
          .run(userId, username, customerId, customer.name, `Updated Follow-up (${data.status})`, updatedAt);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Follow-up error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports", (req, res) => {
    try {
      const reports = {
        policyMade: db.prepare(`
          SELECT c.*, f.* FROM customers c 
          JOIN follow_ups f ON c.id = f.customerId 
          WHERE f.status = 'Policy Made'
        `).all(),
        monthlyBreakdown: db.prepare(`
          SELECT targetYear, targetMonth, COUNT(*) as count, SUM(f.grossPremium) as totalGross, SUM(f.netPremium) as totalNet
          FROM customers c
          JOIN follow_ups f ON c.id = f.customerId
          WHERE f.status = 'Policy Made'
          GROUP BY targetYear, targetMonth
          ORDER BY targetYear DESC, targetMonth DESC
        `).all(),
        proposalMade: db.prepare(`
          SELECT c.*, f.* FROM customers c 
          JOIN follow_ups f ON c.id = f.customerId 
          WHERE f.status = 'Proposal Made'
        `).all(),
        proposalPending: db.prepare(`
          SELECT c.*, f.* FROM customers c 
          JOIN follow_ups f ON c.id = f.customerId 
          WHERE f.status = 'Proposal Pending'
        `).all(),
        followUpOnly: db.prepare(`
          SELECT c.*, f.* FROM customers c 
          JOIN follow_ups f ON c.id = f.customerId 
          WHERE f.status = 'Follow-up Only'
        `).all(),
      };
      res.json(reports);
    } catch (error) {
      console.error("Reports error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
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

  app.post("/api/reset", (req, res) => {
    try {
      db.prepare("DELETE FROM bus_follow_ups").run();
      db.prepare("DELETE FROM bus_working").run();
      db.prepare("DELETE FROM follow_ups").run();
      db.prepare("DELETE FROM customers").run();
      res.json({ success: true });
    } catch (error) {
      console.error("Reset error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
