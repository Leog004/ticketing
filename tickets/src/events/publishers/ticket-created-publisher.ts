import { Publisher, Subjects, TicketCreatedEvent } from '@lg4tickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}