/* ==========================================================
   BIT Campus Portal — default demo data
   This file only contains data, no logic. script.js copies it
   into localStorage the first time the site is opened, so it
   can be edited here without touching the app code.
   ========================================================== */

const DATABASE = {
  users: [
    {
      name: "Admin BIT",
      firstName: "Admin",
      lastName: "BIT",
      email: "admin@bit.bf",
      whatsapp: "+226 70 00 00 00",
      password: "admin123",
      role: "admin",
    },
  ],

  filieres: [
    { name: "Bachelor Computer Science", years: 3 },
    { name: "Bachelor Mechanical Engineering", years: 3 },
    { name: "Bachelor Electrical Engineering", years: 3 },
  ],

  activityTypes: [
    {
      name: "Conference",
      description: "Talks and guest lectures open to all students.",
    },
    {
      name: "Sports",
      description: "Matches and sports events between departments or schools.",
    },
    {
      name: "Hackathon",
      description:
        "Competitive coding and innovation events, usually over 24-48h.",
    },
    {
      name: "Workshop",
      description: "Hands-on sessions to build practical skills.",
    },
  ],

  news: [
    {
      title: "Basket team victory",
      content:
        "The BIT basketball team won its match against ENSK on Saturday, qualifying for the regional finals.",
      date: "2026-07-20",
    },
    {
      title: "CS 27 student won a hackathon",
      content:
        "A third-year Computer Science student took first place at the National Innovation Hackathon in Ouagadougou.",
      date: "2026-07-18",
    },
    {
      title: "New meal at the restaurant",
      content:
        "The campus restaurant introduces a new weekly menu starting Monday, with more local dishes on offer.",
      date: "2026-07-15",
    },
  ],

  clubs: [
    {
      name: "English Club",
      description:
        "Weekly conversation sessions and debate nights to sharpen your English.",
      update: "This week: movie night on Monday at 6pm, Amphi 200.",
    },
    {
      name: "Entrepreneurship Club",
      description: "For students building side projects and startups.",
      update:
        "This week: pitch workshop with a guest founder, Wednesday 4pm at the Amphi 200.",
    },
    {
      name: "Matrix",
      description: "The coding club of BIT.",
      update:
        "This week: Educational AI developed by a CS third year student, demo Friday in Amphi 130 A.",
    },
    {
      name: "Club of Technology",
      description: "The tech and robotics club of BIT.",
      update: "This week: line-following robot demo, Thursday in the Laboratory.",
    },
    {
      name: "Female Empowerment",
      description:
        "A club exclusively for girls. Every week, members learn the stories of women from around the world through live video calls.",
      update: "This week: video call with a guest speaker, Wednesday at 5pm.",
    },
  ],

  activities: [
    {
      title: "Inter-department Hackathon",
      type: "Hackathon",
      date: "2026-08-02",
      location: "Amphi A",
      description:
        "24h hackathon open to all departments, prizes for top 3 teams.",
    },
    {
      title: "BIT vs Norbert Zongo — Basketball",
      type: "Sports",
      date: "2026-07-28",
      location: "Main stadium",
      description: "Friendly match, kickoff at 4pm.",
    },
    {
      title: "AI in Africa — Conference",
      type: "Conference",
      date: "2026-08-05",
      location: "Conference Hall",
      description:
        "Guest speakers: Ms Kweyakie and Dr Lebian will discuss AI adoption.",
    },
  ],

  timetable: [
    {
      filiere: "Bachelor Computer Science",
      annee: 1,
      course: "Introduction to Programming",
      day: "Monday",
      start: "08:00",
      end: "10:00",
      room: "Room 101",
    },
    {
      filiere: "Bachelor Computer Science",
      annee: 1,
      course: "Mathematics I",
      day: "Wednesday",
      start: "10:00",
      end: "12:00",
      room: "Room 101",
    },
    {
      filiere: "Bachelor Computer Science",
      annee: 2,
      course: "Data Structures",
      day: "Tuesday",
      start: "08:00",
      end: "10:00",
      room: "Room 204",
    },
  ],

  exams: [
    {
      filiere: "Bachelor Computer Science",
      annee: 1,
      course: "Introduction to Programming",
      date: "2026-09-10",
      time: "08:00",
      room: "Room 101",
      notes: "Covers chapters 1 to 4.",
    },
    {
      filiere: "Bachelor Computer Science",
      annee: 2,
      course: "Data Structures",
      date: "2026-09-12",
      time: "08:00",
      room: "Room 204",
      notes: "Bring your own calculator.",
    },
  ],
};
