import { motion } from 'framer-motion';
import './TimetablePage.css';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timetableRows = [
  {
    slot: '9:15 AM – 10:15 AM',
    entries: {
      Monday: { label: 'SE & PM', color: 'orange' },
      Tuesday: { label: 'TOC', color: 'purple' },
      Wednesday: { label: 'UNIX', color: 'blue' },
      Thursday: { label: 'TOC', color: 'purple' },
      Friday: { label: 'UNIX', color: 'blue' },
      Saturday: { label: 'RM & IPR', color: 'red' },
    },
  },
  {
    slot: '10:15 AM – 11:15 AM',
    entries: {
      Monday: { label: 'EVS', color: 'green' },
      Tuesday: { label: 'SE & PM', color: 'orange' },
      Wednesday: { label: 'TOC', color: 'purple' },
      Thursday: { label: 'CN', color: 'yellow' },
      Friday: { label: 'UNIX', color: 'blue' },
      Saturday: { label: 'TOC', color: 'purple' },
    },
  },
  {
    slot: '11:15 AM – 11:30 AM',
    breakLabel: '— Tea Break —',
  },
  {
    slot: '11:30 AM – 12:30 PM',
    entries: {
      Monday: { label: 'UNIX', color: 'blue' },
      Tuesday: { label: 'UNIX', color: 'blue' },
      Wednesday: { label: 'SE & PM', color: 'orange' },
      Thursday: { label: 'RM & IPR', color: 'red' },
      Friday: { label: 'RM & IPR', color: 'red' },
      Saturday: { label: 'SE & PM', color: 'orange' },
    },
  },
  {
    slot: '12:30 PM – 1:30 PM',
    breakLabel: '— Lunch Break —',
  },
  {
    slot: '1:30 PM – 2:15 PM',
    entries: {
      Monday: { label: 'TOC', color: 'purple' },
      Tuesday: null,
      Wednesday: null,
      Thursday: { label: 'RM & IPR', color: 'red' },
      Friday: { label: 'CN', color: 'yellow' },
      Saturday: { label: 'CN', color: 'yellow' },
    },
  },
  {
    slot: '2:15 PM – 3:15 PM',
    entries: {
      Monday: { label: 'DLITE', color: 'rose' },
      Tuesday: {
        label: 'DATA VISUALIZATION LAB',
        details: ['[B1] [R.NO:212]', 'MINI-PROJECT - [B2]'],
        color: 'blue',
      },
      Wednesday: {
        label: 'DATA VISUALIZATION LAB',
        details: ['[B2] [R.NO:212]', 'MINI-PROJECT - [B1]'],
        color: 'blue',
      },
      Thursday: {
        label: 'CN LAB',
        details: ['[B1 & B2]', '[R.NO:204]'],
        color: 'yellow',
      },
      Friday: { label: 'DLITE', color: 'rose' },
      Saturday: null,
    },
  },
  {
    slot: '3:15 PM – 4:15 PM',
    entries: {
      Monday: { label: 'DLITE', color: 'rose' },
      Tuesday: {
        label: 'DATA VISUALIZATION LAB',
        details: ['[B2] [R.NO:212]', 'MINI-PROJECT - [B1]'],
        color: 'blue',
      },
      Wednesday: {
        label: 'DATA VISUALIZATION LAB',
        details: ['[B1] [R.NO:212]', 'MINI-PROJECT - [B2]'],
        color: 'blue',
      },
      Thursday: { label: 'DLITE', color: 'rose' },
      Friday: { label: 'DLITE', color: 'rose' },
      Saturday: { label: 'DEPARTMENTAL ACTIVITIES', details: ['(Clubs / NSS / Sports)'], color: 'gray' },
    },
  },
];

const getDetails = (entry) => {
  if (!entry?.details) {
    return [];
  }

  return Array.isArray(entry.details) ? entry.details : [entry.details];
};

export const TimetablePage = () => (
  <div className="timetable-page timetable-page--static">
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="timetable-header"
    >
      <h1 className="timetable-title">Semester V AIML Timetable</h1>
      <p className="timetable-subtitle">Academic Year 2025-26 (Odd)</p>
    </motion.div>

    <div className="timetable-grid-container">
      <table className="timetable-table timetable-table-visual">
        <thead>
          <tr>
            <th className="timetable-time-header">Time</th>
            {days.map((day) => (
              <th key={day} className="timetable-day-header">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timetableRows.map((row) => (
            <tr key={row.slot}>
              <th scope="row" className="timetable-time-cell">
                {row.slot}
              </th>
              {row.breakLabel ? (
                <td className="timetable-break-cell" colSpan={days.length}>
                  {row.breakLabel}
                </td>
              ) : (
                days.map((day) => {
                  const entry = row.entries?.[day];
                  return (
                    <td key={`${row.slot}-${day}`} className="timetable-class-cell">
                      {entry ? (
                        <div className={`timetable-class-block timetable-class-${entry.color ?? 'gray'}`}>
                          <div className="timetable-class-label">{entry.label}</div>
                          {getDetails(entry).map((detail) => (
                            <div key={detail} className="timetable-class-detail">
                              {detail}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </td>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

