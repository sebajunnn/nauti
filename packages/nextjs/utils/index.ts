export const colors = [
    "hsl(var(--background))",
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-5))",
] as const;

export type Colors = (typeof colors)[number];

export const getRandomColor = (): string => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    // Add opacity to the HSL color
    const randomColor = colors[randomIndex];
    return randomColor.replace("hsl", "hsla").replace(")", ", 0.9)");
};
