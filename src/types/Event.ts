 export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  attendees: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  calendarId?: string; // For Google Calendar sync
}

export interface CreateEventDTO {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  location?: string;
  attendees?: string[];
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  allDay?: boolean;
  location?: string;
  attendees?: string[];
}
