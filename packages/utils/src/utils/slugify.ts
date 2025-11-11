/**
 * Slugify strings by removing special characters, replacing spaces with dashes, and converting to lowercase.
 * @param args - The strings to slugify.
 * @returns The slugified string.
 */
export const slugify = (...args: string[]): string => {
    const value = args.join(" ");

    return value
        .normalize("NFD") // split an accented letter in the base letter and the acent
        .replace(/[\u0300-\u036f]/g, "") // remove all previously split accents
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, "") // remove all chars not letters, numbers and spaces (to be replaced)
        .replace(/\s+/g, "-"); // separator
};
