# Google OAuth Setup - Visual Step-by-Step Guide

## Overview

This guide shows you exactly where to find and add your redirect URI in Google Cloud Console.

---

## Step 1: Go to Google Cloud Console

**URL**: https://console.cloud.google.com/

**What you'll see**:
```
┌─────────────────────────────────────────────────────────┐
│  Google Cloud Console                                   │
│  ┌─────────────────────────────────────────────────────┐
│  │ Select a project ▼                                  │
│  └─────────────────────────────────────────────────────┘
│                                                         │
│  [Create a new project] or [Select existing project]   │
└─────────────────────────────────────────────────────────┘
```

**Action**: 
- If you don't have a project, click "Create a new project"
- If you have one, select it from the dropdown

---

## Step 2: Create or Select Your Project

**If creating new**:
```
┌─────────────────────────────────────────────────────────┐
│  New Project                                            │
│  ┌─────────────────────────────────────────────────────┐
│  │ Project name: CSRARS                                │
│  │ Organization: (optional)                            │
│  │ Location: (optional)                                │
│  └─────────────────────────────────────────────────────┘
│  [Create]                                               │
└─────────────────────────────────────────────────────────┘
```

**Action**: Enter project name and click Create

---

## Step 3: Enable Google+ API

**Navigation**:
1. Left sidebar → **APIs & Services**
2. Click **Library**
3. Search for: `Google+ API`
4. Click on it
5. Click **Enable**

**What you'll see**:
```
┌─────────────────────────────────────────────────────────┐
│  Google+ API                                            │
│  ┌─────────────────────────────────────────────────────┐
│  │ [Enable] button                                     │
│  └─────────────────────────────────────────────────────┘
│  Status: Enabled ✓                                      │
└─────────────────────────────────────────────────────────┘
```

---

## Step 4: Create OAuth 2.0 Credentials

**Navigation**:
1. Left sidebar → **APIs & Services**
2. Click **Credentials**
3. Click **+ Create Credentials**
4. Select **OAuth 2.0 Client ID**

**What you'll see**:
```
┌─────────────────────────────────────────────────────────┐
│  Create OAuth 2.0 Client ID                             │
│  ┌─────────────────────────────────────────────────────┐
│  │ Application type:                                   │
│  │ ○ Desktop application                               │
│  │ ○ Web application                                   │
│  │ ○ Android                                           │
│  │ ○ iOS    