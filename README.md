# EduPredict AI 🎓

## Student Success & Early-Warning Intelligence Platform

EduPredict AI is a full-stack machine learning platform designed to identify students who may be at risk of academic failure or dropout and provide an early-warning mechanism for targeted support.

The platform combines machine learning, an interactive web dashboard, student assessments, risk prediction, and intervention-oriented insights into a single system.

---

## 🚀 Live Demo

**Frontend:** https://edu-predict-ai-64gq.vercel.app/

**Backend:** https://edupredict-ai-backend-8jpa.onrender.com/

**GitHub:** https://github.com/YT-PRO12/EduPredictAI

---

## Assessment creation contract

`POST /assessments` creates a new assessment and returns its server-generated
`id`. Client-supplied assessment IDs are ignored, including legacy timestamp IDs,
so simultaneous submissions cannot replace an earlier assessment. Keep the
returned ID for subsequent references. Existing records and student IDs remain
unchanged. Retrying a creation request creates another assessment; this endpoint
does not provide idempotent retries.

Assessment probabilities must be finite percentages from 0 to 100. Invalid values
are rejected before a row is written.

## 🎯 Problem Statement

Educational institutions often identify academically struggling students only after their performance has significantly declined.

Traditional monitoring approaches can be:

- Reactive rather than proactive
- Difficult to scale across large student populations
- Dependent on manual monitoring
- Limited in providing individualized insights

EduPredict AI aims to provide an early-warning system that helps identify students who may require additional academic attention.

---

## 💡 Solution

EduPredict AI uses student-related academic and demographic information to generate a risk prediction through a machine learning pipeline.

The platform provides an end-to-end workflow:

```text
Student Data
     ↓
Assessment
     ↓
Machine Learning Model
     ↓
Risk Prediction
     ↓
Risk Analysis
     ↓
Intervention Support
