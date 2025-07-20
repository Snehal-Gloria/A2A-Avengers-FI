# **App Name**: EcoSense

## Core Features:

- User Onboarding: Streamlined sign-up/login flow (using Firebase Auth or local session) with profile creation including financial goals.
- Smart Dashboard: Displays total net worth, income, savings, and credit health in a visually appealing format. Includes a budget tracker with spending categories.
- AI Chatbot: A chatbot interface powered by Gemini AI handles user prompts related to spending, net worth, and budgeting, with memory-enhanced responses and a tool to incorporate MCP data.
- Eco-Friendly Mode: Show carbon impact of restaurants and spending, and suggest lower carbon alternatives, such as local gardens, food sharing programs or vegetarian restaurants.
- Data Export: Allows users to export their financial insights as JSON/CSV for personal record-keeping.
- User Onboarding & Profile Setup: Sign up/Login screen (Firebase Auth or local session) Profile creation: name, age, financial goals Input/edit income sources, fixed expenses, liabilities Allow optional UPI/Bank SMS read permission (with full privacy warning)
- Financial Insight Agent: Financial Insight Agent
- Budget Flexibility Agent: Budget Flexibility Agent
- Carbon Impact Agent: Carbon Impact Agent
- Opportunity Cost Simulator: Opportunity Cost Simulator
- Location-Aware Spending Recommender: Location-Aware Spending Recommender (Google Maps integration)
- SMS Tracker Integration: Local, on-device parsing of money-related messages Detect bank transfers, UPI payments, auto-debits Classify into categories with AI (use Gemini or regex fallback)
- Eco-Friendly Mode: Show carbon impact of restaurants, travel routes, spending choices Suggest lower carbon alternatives (walking, EV routes, veg meals)
- Scenario Simulator: Allow user to simulate: “What if I increase SIP by ₹2000?”, “What if I rent a home at ₹50K?” Visualize financial outcome across 1/3/5 years.
- Smart Dashboard: Show total net worth, income, savings, credit health Budget tracker per category (Food, Travel, SIP, Rent, etc.) Visualizations using graphs (MPAndroidChart or Jetpack Compose Canvas) Monthly carbon footprint score

## Style Guidelines:

- Soft teal (#70DBD1) to evoke a sense of calm and financial well-being.
- Light grey (#F5F5F5), to ensure the interface is easy to read.
- Muted olive green (#A2B579) to complement the teal and add an organic touch.
- 'PT Sans' (sans-serif) for a modern and approachable feel. Its clean lines are suitable for both headlines and body text, and support excellent readability.
- Use clean, minimalist icons in a style that aligns with Material 3 design principles.
- Subtle animations and transitions to provide feedback and enhance user experience, such as loading animations and interactive prompts.