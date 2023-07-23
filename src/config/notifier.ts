/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageOptions } from 'naive-ui/es/message';

type InsideNames = 'notify::info' | 'notify::success' | 'notify::warning' | 'notify::error' | 'api::error';

type NotifierEvents = InsideNames & string;

export class Notifier {
    on(event: NotifierEvents, callback: (...args: any[]) => void) {
        document.addEventListener(event, (e: CustomEventInit) => callback(...e.detail));
        return this;
    }

    emit(event: NotifierEvents, ...data: any[]) {
        document.dispatchEvent(new CustomEvent(event, { detail: data }));
    }

    remove(event: NotifierEvents, callback: (...args: any[]) => void) {
        document.removeEventListener(event, callback);
        return this;
    }

    success(msg: string, options: MessageOptions = { closable: false, duration: 2 * 1000 }) {
        this.emit('notify::success', msg, options);
    }

    info(
        msg: string | Record<string, string | number | boolean | null>,
        options: MessageOptions = { closable: false, duration: 2 * 1000 },
    ) {
        this.emit('notify::info', typeof msg == 'string' ? msg : JSON.stringify(msg), options);
    }

    error(msg: string, options: MessageOptions = { closable: true, duration: 5 * 1000 }) {
        this.emit('notify::error', msg, options);
    }

    warning(msg: string, options: MessageOptions = { closable: false, duration: 2 * 1000 }) {
        this.emit('notify::warning', msg, options);
    }
}

export const notifier = new Notifier();
