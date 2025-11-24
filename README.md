# 🚀 BMI Assessment System – React + Python Flask

A complete Body Mass Index (BMI) assessment system with:

- React Frontend (Home → Registration → Dashboard)
- Python Flask Backend (User registration, BMI calculation, PDF generation)
- Weight fetching from an external weighing machine `.exe`
- Clean UI with solid colors
- PDF Report Download

---

## ✨ Features

### **Frontend (React)**

- Home page with navigation
- User registration page
- Dashboard:
  - Fetch weight from machine (.exe)
  - Enter height
  - Auto-calculate BMI
  - Show BMI category with color tags
  - Download BMI PDF Report

### **Backend (Flask)**

- User registration API
- Read weight using subprocess
- Generate PDF reports using `fpdf2`
- CORS enabled for frontend communication

---

## 📁 Project Structure
```
BMI_Assessment/
│
├── backend/
│ ├── app.py
│ ├── pdf_generator.py
│ ├── weight_reader.exe
│ └── users.json (optional)
│
└── frontend/
├── src/
│ ├── pages/
│ │ ├── Home.jsx
│ │ ├── Register.jsx
│ │ └── Dashboard.jsx
│ ├── App.jsx
│ ├── main.jsx
│ ├── index.css
│ └── page.css
└── package.json
```
---

## ⚙️ Installation & Setup

### **1️ Backend Setup**

```bash
cd backend
pip install flask flask-cors fpdf2
python app.py
```

## **2 Frontend Setup**

```bash
cd frontend
npm install
npm install react-router-dom
```
