import { Request, Response, NextFunction } from "express";
import {
  selectAllEvents,
  selectSingleEvent,
  updateEvent,
  insertEvent,
  deleteEvent,
  joinEvent,
  selectEventsByCreator,
  selectEventsByTitle,
} from "../models/events-model";
import { Event } from "../db/tableTypes";

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await selectAllEvents();
    res.status(200).json({ events: result });
  } catch (err) {
    next(err);
  }
};

export const getSingleEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const event_id = Number(req.params.event_id);

    if (isNaN(event_id) || event_id <= 0) {
      res.status(400).json({ msg: "Invalid Event ID" });
      return;
    }

    const result = await selectSingleEvent(event_id);

    if (!result) {
      res.status(404).json({ msg: "Event not found" });
      return;
    }

    res.status(200).json({ event: result });
  } catch (err) {
    next(err);
  }
};

export const patchEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const event_id = Number(req.params.event_id);
    const UpdateEventData: Partial<Event> = req.body;

    if (isNaN(event_id) || event_id <= 0) {
      res.status(400).json({ msg: "Invalid Event ID" });
      return;
    }

    const result = await updateEvent(event_id, UpdateEventData);

    if (!result) {
      res.status(404).json({ msg: "Event not found" });
      return;
    }

    res.status(200).json({ event: result });
  } catch (err) {
    next(err);
  }
};

export const addEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const addEventData: Partial<Event> = req.body;
    const result = await insertEvent(addEventData);
    res.status(201).json({ event: result });
  } catch (err) {
    next(err);
  }
};

export const deleteEventByID = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const event_id = Number(req.params.event_id);
    if (isNaN(event_id) || event_id <= 0) {
      res.status(400).json({ msg: "Invalid Event ID" });
      return;
    }

    const result = await deleteEvent(event_id);

    if (!result) {
      next({ status: 404, msg: "Event Not Found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const joinEventByID = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const event_id = Number(req.params.event_id);
    if (isNaN(event_id) || event_id <= 0) {
      res.status(400).json({ msg: "Invalid Event ID" });
      return;
    }

    const user = (req as any).user;
    const user_id = user.user_id;

    const result = await joinEvent(event_id, user_id);

    if (!result) {
      res.status(404).json({ msg: "Event not found" });
      return;
    }

    res.status(201).json({ event_member: result });
  } catch (err) {
    next(err);
  }
};

export const getEventsCreatedByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = Number(req.params.user_id);

    if (isNaN(user_id) || user_id <= 0) {
      res.status(400).json({ msg: "Invalid User ID" });
      return;
    }

    const result = await selectEventsByCreator(user_id);
    res.status(200).json({ events: result });
  } catch (err) {
    next(err);
  }
};

export const getEventsByTitle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const title = req.query.title as string;

    if (!title || title.trim().length === 0) {
      res.status(400).json({ msg: "Title query parameter is required" });
      return;
    }

    const result = await selectEventsByTitle(title.trim());
    res.status(200).json({ events: result });
  } catch (err) {
    next(err);
  }
};
