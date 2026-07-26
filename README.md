# BIT Student Portal

## Description

A student portal website for Burkina Institute of Technology.
Students and admins can sign in, and admins can post news, activities,
timetables, exams and club updates from a dashboard.

This is a front-end only project (no real backend). All the data is
saved in the browser's `localStorage`, so it's mostly a demo / school
project to practice HTML, CSS and JavaScript.

## Features

- Student sign up / sign in
- Admin sign up / sign in
- Admin dashboard to manage:
  - News
  - Activities (with types like Conference, Sports, Hackathon...)
  - Timetables (by filière and year)
  - Exams (by filière and year)
  - Club weekly updates
  - Filières, clubs and activity types (add new ones anytime)
- Export all the data as a `.csv` file
- Responsive navbar (mobile menu)

## Technologies

- HTML
- CSS
- JavaScript (vanilla, no framework)
- LocalStorage (used as a fake database)

## Installation

git clone https://github.com/DeraAlimatouSadia/Group_19

Then just open `index.html` in your browser. No build step, no server
needed.

## Structure

Group_19/

│ pages/
| index.html
│ sign.html
│ dashboard.html
│ timetable.html
│ exam.html
│ clubs.html
│ activities.html
│ news.html

│css/
│ style.css

|js/
│ script.js (app logic)
│ database.js (default demo data)

│images/
│ bit.png

## Admin account (demo)

- Email: `admin@bit.bf`
- Password: `admin123`

Anyone can create a new admin account from the sign in page too, all admins share the same dashboard.
Two accounts can't use the same e-mail

## Default data

All the starting data (news, clubs, filières, timetable, exams...)
lives in `database.js`. It gets copied into `localStorage` the first
time the site is opened, so it's easy to edit without touching the
rest of the code.

## Future improvements

- Real backend (PHP + MySQL, or Node)
- Search bar
- Notifications
- Better responsive design on some pages
- Password hashing (right now it's plain text)
- Students restriction from accessing class's informations other than theirs
