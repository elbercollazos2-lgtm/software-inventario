import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return '$0';

    const num = Math.round(Number(amount));
    const str = num.toString();
    let result = "";
    let count = 0;

    for (let i = str.length - 1; i >= 0; i--) {
        result = str[i] + result;
        count++;

        if (i > 0) {
            if (count === 3) {
                result = "." + result;
            } else if (count === 6) {
                result = "'" + result;
            } else if (count === 9) {
                result = "." + result;
            }
        }
    }

    return "$" + result;
}
