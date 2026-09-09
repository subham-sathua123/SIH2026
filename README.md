# 🌾 Kisan Setu (किसान सेतु)
> **Smart Agricultural Procurement, Digital Tokenization & Live Queue Management System**

[![SIH 2026](https://img.shields.io/badge/Hackathon-SIH%202026-orange.svg)](https://sih.gov.in/)
[![React](https://img.shields.io/badge/Frontend-React%2018-blue.svg?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Problem Statement

Agricultural Procurement Centres (APMC Mandis) across India face severe operational bottlenecks during peak harvesting seasons:
- **Endless Waiting Queues:** Farmers wait in long physical lines with tractors for days in harsh weather.
- **Unpredictable Capacity:** Mandi staff struggle to manage overcrowding and unpredictable incoming crop volumes.
- **Lack of Transparency:** Farmers lack real-time visibility into queue progression, token status, and Direct Benefit Transfer (DBT) payment timelines.

## 🚀 The Solution: Kisan Setu

**Kisan Setu** (*Bridge for Farmers*) digitizes and streamlines the entire government procurement workflow. It acts like a **digital fast-pass for agricultural procurement**:

1. **Digital Slot Booking:** Farmers select their nearest Mandi, preferred date, time slot, crop commodity, and quantity to get a **digital token**.
2. **Live Queue & Wait Time Estimator:** Real-time queue tracker computes estimated wait time based on tokens ahead and average processing speed.
3. **Mandi Counter Operations:** Staff seamlessly call tokens, process crop verification, log weighed quantities, and update payment statuses.
4. **End-to-End Transparency:** 7-step progress tracking from booking confirmation to Direct Benefit Transfer (DBT) credit into the farmer's bank account.
5. **Bilingual Accessibility:** Native support for **Hindi (हिंदी)** and **English** for maximum accessibility in rural communities.

---

## ✨ Key Features

### 🌾 1. Farmer Portal (`/farmer`, `/book`)
- **Smart Booking Engine:** Reserve slots based on Mandi operating hours and max slot capacity.
- **Digital Token Display:** Instant digital token generation (e.g., `#005`) with QR/token card view.
- **Live Queue Tracker:** Auto-refreshing dashboard showing:
  - Token currently being served
  - Number of farmers ahead in line
  - Dynamic estimated wait time (`Farmers Ahead × Avg Processing Minutes`)
- **7-Stage Lifecycle Tracker:**
  $$\text{Booked} \rightarrow \text{Arrived} \rightarrow \text{Token Verified} \rightarrow \text{Weighing} \rightarrow \text{Procurement Completed} \rightarrow \text{Payment Processing} \rightarrow \text{DBT Paid}$$
- **Instant Notifications:** Web and SMS alerts for token calls and payment credits.

### 👷 2. Staff Portal (`/staff`)
- **Counter Queue Controller:** One-click **"Call Next Farmer"** action that automatically updates queue status and alerts the farmer.
- **Verification & Weighing Workflow:** Mark arrival, log weighed crop amounts, and transition bookings through procurement stages.
- **DBT Payment Logging:** Input final disbursement amounts and mark payments as `Paid`.

### 👑 3. Admin Analytics Portal (`/admin`)
- **System-Wide Metrics:** Real-time summary cards for total farmers, active bookings, completed procurements, and pending/completed payments.
- **Procurement Analytics:**
  - 7-day daily booking trend graphs.
  - Commodity breakdown (Paddy, Wheat, Gram, Pulses in Quintals).
  - Average Mandi waiting time monitor.
- **Mandi & User Management:** Add new procurement centres, adjust slot capacities, manage staff allocations, and toggle user account statuses.

---

## 🛠️ Tech Stack

| Domain | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React.js 18 | Single Page Application UI rendering |
| **Styling & Icons** | TailwindCSS + Lucide Icons | Modern, responsive, mobile-first design |
| **State & Localization** | React Context API | Auth state & English/Hindi translation context |
| **Toast Alerts** | Sonner | Real-time user notifications |
| **Backend Framework** | Python FastAPI | Asynchronous RESTful API server |
| **Database** | MongoDB + Motor | Async MongoDB driver for data persistence |
| **Authentication** | PyJWT + Bcrypt | Secure HTTP-Only cookie-based JWT authentication |

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[🌾 Farmer / User] -->|Browses / Books / Tracks Queue| B[React 18 Frontend]
    C[👷 Mandi Staff] -->|Calls Tokens / Updates Status| B
    D[👑 Admin] -->|Manages Mandis & Views Analytics| B

    B -->|HTTP / REST API Calls| E[Python FastAPI Backend]
    E -->|Bcrypt & JWT Auth| F[Security & Middleware]
    E -->|Real-Time Queue Engine| G[Queue & Notification Service]
    E -->|Async Motor Queries| H[(MongoDB Database)]

    subgraph MongoDB Collections
        H --> H1[(users)]
        H --> H2[(centres)]
        H --> H3[(slots)]
        H --> H4[(bookings)]
        H --> H5[(notifications)]
    end
