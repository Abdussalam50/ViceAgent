// Web Worker for processing report data without blocking the main thread
self.onmessage = (e) => {
    const { reports, searchTerm } = e.data;

    try {
        if (!searchTerm) {
            self.postMessage(reports);
            return;
        }

        const lowerSearch = searchTerm.toLowerCase();
        const filtered = reports.filter(r => {
            // Priority 1: Device Name
            const deviceMatch = r.device_name?.toLowerCase().includes(lowerSearch);
            if (deviceMatch) return true;

            // Priority 2: Health Score (if search is a number)
            const scoreMatch = r.health_score?.toString().includes(lowerSearch);
            if (scoreMatch) return true;

            // Priority 3: Scan Date
            const dateMatch = new Date(r.created_at).toLocaleString('id-ID').toLowerCase().includes(lowerSearch);
            if (dateMatch) return true;

            return false;
        });

        console.log(`[DEBUG] Worker filtered ${filtered.length} reports.`);
        self.postMessage(filtered);
    } catch (error) {
        console.error("Worker filtering error:", error);
        // Fallback to original reports on error
        self.postMessage(reports);
    }
};
