# Blueprint

## Overview

This document outlines the structure, features, and planned modifications for the Next.js application. The application is a form for reporting mission data, which is then sent to a Google Apps Script.

## Current State & Features

### Implemented Styles & Designs:
- The application uses Tailwind CSS for styling.
- It has a dark and light mode.
- The main components are from `shadcn/ui`.
- It has a form-based layout with a header and footer.

### Implemented Features:
- A form for submitting mission reports.
- The form includes fields for mission type, pilot, crew, UAV type, stream link, target details, and event details.
- The form data is sent to a Google Apps Script.

## Planned Changes

### Requested Change:
The user wants to optimize the form by adding dynamic validation, tooltips, and pop-up messages. The form should be divided into three groups: "Загальна інформація", "Ціль, результат", and "Деталі події".

### Plan:
1.  **Update `components/report-form.tsx`:**
    *   Group form fields into three sections.
    *   Change the "Місія" field to a `Select` component.
    *   Set the "Час скиду" date to default to today.
    *   Change the "Населений пункт" field to a `Select` component with a list of settlements from the Pokrovsk Raion.
2.  **Update `app/actions/report-actions.ts`:**
    *   Update the `zod` schema to include validation for the new fields.
    *   Improve error handling and user feedback messages.
