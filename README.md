# SplitSaathi 🤝 
### *Smart Expense Splitting & Debt Simplification*

**Live Demo:** [splitsaathi-six.vercel.app](https://splitsaathi-six.vercel.app)

**SplitSaathi** is a specialized expense management platform built to handle complex group finances. It simplifies peer-to-peer debts using a custom greedy algorithm, ensuring that even in large groups, the number of transactions required to settle up is minimized.

---

## 🚀 Key Features

* **Real-time Synchronization:** Leverages Firebase Firestore Snapshots to update group balances and activity feeds instantly across all members.
* **Waterfall Debt Algorithm:** A custom-built greedy algorithm that calculates net balances and minimizes peer-to-peer transactions.
* **Unified Notification Center:** A central hub for managing Group Invitations, Friend Requests, and Payment Verifications.
* **Smart Dashboards:** At-a-glance overview of total "Owed to You" and "You Owe" amounts across all groups.
* **Responsive Design:** A fully mobile-responsive UI built with Tailwind CSS and Lucide React.

---

## 🛠️ Technical Stack

* **Frontend:** [React.js](https://reactjs.org/) (Vite)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Authentication)
* **Deployment:** [Vercel](https://vercel.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **State Management:** React Context API & Custom Hooks

---

## 🏗️ Project Structure

```text
src/
├── components/
│   ├── common/         # Reusable UI: Button, Modal, Avatar, Badge, Skeleton
│   ├── expenses/       # Expense management: ExpenseCard, ExpenseForm
│   ├── groups/         # Group-specific views and logic
│   └── notifications/  # NotificationBell and Item components
├── context/
│   ├── AuthContext.jsx         # Global Firebase Authentication state
│   └── NotificationContext.jsx # Real-time notification listeners
├── hooks/
│   ├── useBalances.js  # The "Waterfall" logic for debt simplification
│   ├── useExpenses.js  # Custom hook for real-time expense data
│   └── useToast.js     # Global notification/toast management
├── services/
│   ├── groups.js       # Firestore CRUD for groups
│   ├── expenses.js     # Firestore CRUD for expenses
│   └── users.js        # User profile and friendship services
└── utils/
    └── formatters.js   # Currency (INR) and Date formatting
