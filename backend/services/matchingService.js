const timeToMinutes = (value) => {
    if (typeof value !== 'string') return null;
    const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
};

const normalizeSkillList = (skills) => {
    if (!Array.isArray(skills)) return [];
    return skills
        .map((skill) => (typeof skill?.name === 'string' ? skill.name.trim().toLowerCase() : ''))
        .filter(Boolean);
};

const computeAvailabilityOverlap = (availability1, availability2) => {
    const slots1 = Array.isArray(availability1?.weeklySlots) ? availability1.weeklySlots : [];
    const slots2 = Array.isArray(availability2?.weeklySlots) ? availability2.weeklySlots : [];
    let overlapMinutes = 0;

    for (const a of slots1) {
        const aStart = timeToMinutes(a.startTime);
        const aEnd = timeToMinutes(a.endTime);
        if (aStart === null || aEnd === null || aEnd <= aStart) continue;

        for (const b of slots2) {
            if (String(a.day).toLowerCase() !== String(b.day).toLowerCase()) continue;
            const bStart = timeToMinutes(b.startTime);
            const bEnd = timeToMinutes(b.endTime);
            if (bStart === null || bEnd === null || bEnd <= bStart) continue;

            const overlap = Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
            overlapMinutes += overlap;
        }
    }

    return overlapMinutes;
};

const calculateMatchScore = (user1, user2) => {
    const id1 = user1?.userId?.toString?.() || user1?.userId || user1?._id;
    const id2 = user2?.userId?.toString?.() || user2?.userId || user2?._id;
    if (!id1 || !id2 || String(id1) === String(id2)) {
        return { score: 0, reasons: ['Self-match not allowed'] };
    }

    const u1Wanted = normalizeSkillList(user1.skillsWanted);
    const u1Offered = normalizeSkillList(user1.skillsOffered);
    const u2Wanted = normalizeSkillList(user2.skillsWanted);
    const u2Offered = normalizeSkillList(user2.skillsOffered);

    const overlapPrimary = u1Wanted.filter((skill) => u2Offered.includes(skill));
    const overlapReciprocal = u2Wanted.filter((skill) => u1Offered.includes(skill));

    const primaryRatio = u1Wanted.length ? overlapPrimary.length / u1Wanted.length : 0;
    const reciprocalRatio = u2Wanted.length ? overlapReciprocal.length / u2Wanted.length : 0;

    const overlapMinutes = computeAvailabilityOverlap(user1.availability, user2.availability);
    const availabilityScore = Math.min(1, overlapMinutes / 180);

    const trust1 = Number(user1.trustScore ?? 100);
    const trust2 = Number(user2.trustScore ?? 100);
    const trustScore = Math.max(0, Math.min(1, (trust1 + trust2) / 200));

    const weightedScore = (
        primaryRatio * 0.45
        + reciprocalRatio * 0.2
        + availabilityScore * 0.2
        + trustScore * 0.15
    );

    const reasons = [];
    if (overlapPrimary.length) reasons.push(`Matches wanted skills: ${overlapPrimary.join(', ')}`);
    if (overlapReciprocal.length) reasons.push(`Reciprocal skill value: ${overlapReciprocal.join(', ')}`);
    if (overlapMinutes > 0) reasons.push(`Availability overlap: ${overlapMinutes} minutes/week`);
    reasons.push(`Combined trust baseline: ${Math.round(trustScore * 100)}`);

    return {
        score: Math.round(weightedScore * 100),
        reasons
    };
};

module.exports = {
    calculateMatchScore,
    computeAvailabilityOverlap
};
