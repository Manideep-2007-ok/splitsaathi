# SplitSaathi 🤝 
### *Smart Expense Splitting & Debt Simplification*

**SplitSaathi** is a specialized expense management platform built to handle complex group finances. It simplifies peer-to-peer debts using a custom greedy algorithm, ensuring that even in large groups, the number of transactions required to settle up is minimized.

---

## 🚀 Core Functionalities

### 1. Group & Expense Management
* **Real-time Synchronization:** Leverages Firebase Firestore Snapshots to update group balances and activity feeds instantly across all members.
* **Flexible Splitting:** Supports equal splits, percentage-based distributions, and exact amount assignments.
* **Category Tracking:** Automatic categorization of expenses (Food, Travel, Rent, etc.) for monthly spending analytics.

### 2. The "Waterfall" Debt Algorithm (DSA)
The heart of SplitSaathi is a greedy algorithm designed to solve the "Maximum Flow" problem in debt simplification:
* **Net Calculation:** Aggregates all group transactions into a single `netBalance` for each user.
* **Transaction Minimization:** Identifies the largest debtor and matches them with the largest creditor to eliminate balances in the fewest steps possible.
* **Non-Falsifiable Settlements:** Built-in "Human Webhook" system where payers provide a UTR/Transaction ID and receivers must verify the receipt before the group balance updates.

### 3. Unified Notification System
* **Social Hub:** A single notification center for Group Invitations, Friend Requests, and Payment Verification requests.
* **Real-time Alerts:** Integrated `react-toastify` notifications for background activity.

---

## 🛠️ Project Structure

```text
src/
├── components/
│   ├── common/         # Button, Modal, Avatar, Badge, Skeleton
│   ├── expenses/       # ExpenseCard, ExpenseForm
│   ├── settlement/     # SettleModal, UpiButton, QrDisplay
│   └── notifications/  # NotificationBell, NotificationItem
├── context/
│   ├── AuthContext.jsx         # Firebase Auth State
│   └── NotificationContext.jsx # Live Notification Listeners
├── hooks/
│   ├── useBalances.js  # Core DSA logic for debt simplification
│   ├── useExpenses.js  # Real-time expense fetching
│   └── useToast.js     # Global alert management
├── services/
│   ├── groups.js       # CRUD operations for Firestore Groups
│   ├── settlements.js  # Logic for recording payments
│   └── users.js        # Profile and friend management
└── utils/
    └── formatters.js   # Currency and Date formatting
