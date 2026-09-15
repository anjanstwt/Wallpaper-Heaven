"use client";

interface TermSection {
    id: number;
    title: string;
    highlight: string;
    content: string;
}

export const TermsAndConditions = () => {
    const termsData: TermSection[] = [
        {
            id: 1,
            title: "Acceptance of Terms",
            highlight: "agreement",
            content: "By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.\n\nThese terms of service may be updated at any time without prior notice. Your continued use of the service constitutes acceptance of any changes."
        },
        {
            id: 2,
            title: "Use License",
            highlight: "permissions",
            content: "By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.\n\nThese terms of service may be updated at any time without prior notice. Your continued use of the service constitutes acceptance of any changes."
        },
        {
            id: 3,
            title: "Privacy Policy",
            highlight: "data protections",
            content: "By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.\n\nThese terms of service may be updated at any time without prior notice. Your continued use of the service constitutes acceptance of any changes."
        },
        {
            id: 4,
            title: "Prohibited Uses",
            highlight: "restrictions",
            content: "By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.\n\nThese terms of service may be updated at any time without prior notice. Your continued use of the service constitutes acceptance of any changes."
        },
        {
            id: 5,
            title: "Limitation of Liability",
            highlight: "Liability limits",
            content: "By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.\n\nThese terms of service may be updated at any time without prior notice. Your continued use of the service constitutes acceptance of any changes."
        }
    ];

    return (
        <div className="max-w-4xl mx-auto bg-white min-h-screen font-sans px-4 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mt-16 border-t-4 border-b-4 border-black pt-6 pb-6 sm:pt-8 sm:pb-8 mb-8">
                <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-bold tracking-wider text-black">
                    TERMS & CONDITIONS
                </h1>
            </div>

            <div>
                {termsData.map((term: TermSection) => (
                    <div key={term.id} className="mb-6">
                        <h2 className="text-lg sm:text-xl font-bold mb-4 text-black underline">
                            {term.title}
                        </h2>
                        <div className="text-justify text-black leading-relaxed text-sm sm:text-base">
                            {term.content.split("\n").map((paragraph, index) => (
                                <p key={index} className={paragraph.trim() ? "mb-4" : ""}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8 text-center">
                <p className="text-green-700 font-medium">
                    {termsData.length} sections published
                </p>
            </div>
        </div>
    );
};
