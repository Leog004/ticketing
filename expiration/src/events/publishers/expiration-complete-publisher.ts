import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@lg4tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
