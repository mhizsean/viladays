import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../api/events";
import type { Event } from "../types/event";

type Options = {
  /** Runs after create or update succeeds (not after delete). */
  onSaved?: () => void;
};

export function useAdminEventsPanel(options?: Options) {
  const queryClient = useQueryClient();
  const onSaved = options?.onSaved;

  const invalidateEvents = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
  }, [queryClient]);

  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: () => getEvents(),
  });

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      invalidateEvents();
      onSaved?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Event> }) =>
      updateEvent(id, data),
    onSuccess: () => {
      invalidateEvents();
      onSaved?.();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: invalidateEvents,
  });

  return {
    eventsQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
