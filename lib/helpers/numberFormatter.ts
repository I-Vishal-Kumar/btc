export const formatNumber = (num: number, options: { compact?: boolean, separator?: string } = {}) => {
    if (isNaN(num)) return "0";
  
    const { compact = false, separator = "," } = options;
  
    // Compact notation (e.g., 1.2K, 3.4M)
    if (compact) {
      const suffixes = ["", "K", "M", "B", "T"];
      let index = 0;
      while (num >= 1000 && index < suffixes.length - 1) {
        num /= 1000;
        index++;
      }
      return `${num.toFixed(2).replace(/\.0$/, "")}${suffixes[index]}`;
    }
  
    // Add thousand separators (e.g., 12,345,678)
    return num.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  };
  