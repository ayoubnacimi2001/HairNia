import React, { useState, useRef, useEffect } from "react";
import { 
  addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, 
  isSameMonth, isToday, startOfMonth, startOfWeek, subMonths, setHours, setMinutes
} from "date-fns";

// --- Icons (Preserved from your original code) ---
const CalendarIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" className="fill-current">
    <path fillRule="evenodd" clipRule="evenodd" d="M5.5 0.5V1.25V2H10.5V1.25V0.5H12V1.25V2H14H15.5V3.5V13.5C15.5 14.8807 14.3807 16 13 16H3C1.61929 16 0.5 14.8807 0.5 13.5V3.5V2H2H4V1.25V0.5H5.5ZM2 3.5H14V6H2V3.5ZM2 7.5V13.5C2 14.0523 2.44772 14.5 3 14.5H13C13.5523 14.5 14 14.0523 14 13.5V7.5H2Z" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" className="fill-current">
    <path fillRule="evenodd" clipRule="evenodd" d="M10.5 14.0607L9.96966 13.5303L5.14644 8.7071C4.75592 8.31658 4.75592 7.68341 5.14644 7.29289L9.96966 2.46966L10.5 1.93933L11.5607 2.99999L11.0303 3.53032L6.56065 7.99999L11.0303 12.4697L11.5607 13L10.5 14.0607Z" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" className="fill-current">
    <path fillRule="evenodd" clipRule="evenodd" d="M5.50001 1.93933L6.03034 2.46966L10.8536 7.29288C11.2441 7.68341 11.2441 8.31657 10.8536 8.7071L6.03034 13.5303L5.50001 14.0607L4.43935 13L4.96968 12.4697L9.43935 7.99999L4.96968 3.53032L4.43935 2.99999L5.50001 1.93933Z" />
  </svg>
);
const ClockIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" className="fill-current">
    <path fillRule="evenodd" clipRule="evenodd" d="M8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5ZM8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM8.75 3.5V7.68934L11.5303 10.4697L10.4697 11.5303L7.25 8.31066V3.5H8.75Z" />
  </svg>
);

export type RangeValue = Date | null;

interface DateRangePickerProps {
  value: RangeValue;
  onChange: (date: RangeValue) => void;
  inline?: boolean;
}

export const DateRangePicker = ({ value, onChange, inline = false }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const calendarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (inline) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Generate days for the grid
  const daysArray = [];
  let day = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const endDate = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  while (day <= endDate) {
    daysArray.push(day);
    day = addDays(day, 1);
  }

  const handleDateClick = (clickedDay: Date) => {
    let newDate = clickedDay;
    if (value) {
      newDate = setHours(newDate, value.getHours());
      newDate = setMinutes(newDate, value.getMinutes());
    } else {
      newDate = setHours(newDate, 12);
      newDate = setMinutes(newDate, 0);
    }
    onChange(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!value) return;
    const [hours, minutes] = e.target.value.split(':').map(Number);
    onChange(setMinutes(setHours(value, hours), minutes));
  };

  const displayFormat = value 
    ? format(value, "MMM d, yyyy - HH:mm")
    : "Select Date & Time";

  return (
    <div className={`font-sans w-full ${inline ? '' : 'relative'}`} ref={calendarRef}>
      {/* Trigger Button */}
      {!inline && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-3 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-[11px] uppercase tracking-widest focus:outline-none focus:border-primary-400 hover:border-primary-400 transition-colors w-full text-left"
        >
          <CalendarIcon />
          <span className="truncate">{displayFormat}</span>
        </button>
      )}

      {(isOpen || inline) && (
        <div className={inline ? "w-full py-2" : "absolute top-14 left-0 z-50 p-5 bg-[var(--card)] border border-[var(--border)] shadow-2xl rounded-sm w-[320px]"}>
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-[var(--foreground)]">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <div className="flex gap-2 text-[var(--foreground)]/60">
              <button onClick={prevMonth} className="hover:text-primary-400 p-1"><ArrowLeftIcon /></button>
              <button onClick={nextMonth} className="hover:text-primary-400 p-1"><ArrowRightIcon /></button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 text-center text-[10px] tracking-widest text-[var(--foreground)]/50 uppercase mb-2">
            <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 items-center gap-y-1 mb-4">
            {daysArray.map((dayIter) => {
              const isSelected = value && isSameDay(dayIter, value);

              return (
                <button
                  key={dayIter.toString()}
                  type="button"
                  className={`flex items-center justify-center text-sm rounded-sm cursor-pointer transition-colors h-8
                    ${!isSameMonth(dayIter, currentDate) ? "text-[var(--foreground)]/30" : "text-[var(--foreground)]"}
                    ${isSelected ? "bg-primary-400 text-black font-bold" : "hover:bg-[var(--foreground)]/10"}
                    ${!isSelected && isToday(dayIter) ? "border border-primary-400 text-primary-400" : ""}
                  `}
                  onClick={() => handleDateClick(dayIter)}
                >
                  {format(dayIter, "d")}
                </button>
              );
            })}
          </div>

          {/* Time Selector */}
          {value && (
            <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-60">
                <ClockIcon /> Time
              </div>
              <input
                type="time"
                value={format(value, "HH:mm")}
                onChange={handleTimeChange}
                className="bg-transparent border border-[var(--border)] rounded-sm px-3 py-1.5 text-[11px] font-mono outline-none focus:border-primary-400 hover:border-primary-400 transition-colors"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};