import { jsPDF } from 'jspdf';
import type { AnalysisResult, CheckResult } from '../types/index';

// Modern color palette
const COLORS = {
    primary: { r: 99, g: 102, b: 241 },      // Indigo
    secondary: { r: 139, g: 92, b: 246 },    // Purple
    success: { r: 34, g: 197, b: 94 },       // Green
    warning: { r: 251, g: 146, b: 60 },      // Orange
    danger: { r: 239, g: 68, b: 68 },        // Red
    info: { r: 59, g: 130, b: 246 },         // Blue
    dark: { r: 17, g: 24, b: 39 },           // Dark blue-gray
    muted: { r: 100, g: 116, b: 139 },       // Slate
    light: { r: 241, g: 245, b: 249 },       // Light gray
};

// Tier colors
const TIER_COLORS = {
    strong: COLORS.success,
    decent: COLORS.info,
    weak: COLORS.warning,
    poor: COLORS.danger,
};

export async function generatePdfReport(
    username: string,
    analyses: AnalysisResult[]
): Promise<Buffer> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Helper function to draw a rounded rectangle
    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number, fill = false) => {
        if (fill) {
            doc.roundedRect(x, y, width, height, radius, radius, 'F');
        } else {
            doc.roundedRect(x, y, width, height, radius, radius, 'S');
        }
    };

    // Helper function to draw gradient background (simulated with rectangles)
    const drawGradientHeader = (y: number, height: number) => {
        const steps = 50;
        const stepHeight = height / steps;
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const r = COLORS.primary.r + (COLORS.secondary.r - COLORS.primary.r) * ratio;
            const g = COLORS.primary.g + (COLORS.secondary.g - COLORS.primary.g) * ratio;
            const b = COLORS.primary.b + (COLORS.secondary.b - COLORS.primary.b) * ratio;
            doc.setFillColor(r, g, b);
            doc.rect(0, y + (i * stepHeight), pageWidth, stepHeight, 'F');
        }
    };

    // Helper function to draw progress bar
    const drawProgressBar = (x: number, y: number, width: number, percentage: number, tier: string) => {
        const barHeight = 8;
        const tierColor = TIER_COLORS[tier as keyof typeof TIER_COLORS] || COLORS.muted;
        
        // Background
        doc.setFillColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
        drawRoundedRect(x, y, width, barHeight, 2, true);
        
        // Progress
        const progressWidth = (width * percentage) / 100;
        doc.setFillColor(tierColor.r, tierColor.g, tierColor.b);
        drawRoundedRect(x, y, progressWidth, barHeight, 2, true);
        
        // Border
        doc.setDrawColor(tierColor.r, tierColor.g, tierColor.b);
        doc.setLineWidth(0.5);
        drawRoundedRect(x, y, width, barHeight, 2, false);
        doc.setLineWidth(0.2);
    };

    // Helper function to draw a badge
    const drawBadge = (x: number, y: number, text: string, color: typeof COLORS.success) => {
        const padding = 3;
        const textWidth = doc.getTextWidth(text);
        const badgeWidth = textWidth + (padding * 2);
        const badgeHeight = 6;
        
        doc.setFillColor(color.r, color.g, color.b);
        drawRoundedRect(x, y - 4, badgeWidth, badgeHeight, 2, true);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(text, x + padding, y);
    };

    // Helper function to draw category breakdown
    const drawCategoryBreakdown = (x: number, y: number, checks: CheckResult[]) => {
        const categories = ['readme', 'commits', 'structure', 'testing', 'deployment', 'practices'];
        const categoryNames: Record<string, string> = {
            readme: 'README',
            commits: 'Commits',
            structure: 'Structure',
            testing: 'Testing',
            deployment: 'Deployment',
            practices: 'Practices',
        };
        
        const categoryScores: Record<string, { points: number; maxPoints: number }> = {};
        
        // Calculate scores per category
        categories.forEach(cat => {
            categoryScores[cat] = { points: 0, maxPoints: 0 };
        });
        
        checks.forEach(check => {
            if (categoryScores[check.category]) {
                categoryScores[check.category].points += check.points;
                categoryScores[check.category].maxPoints += check.maxPoints;
            }
        });
        
        let currentY = y;
        const barWidth = 80;
        const rowHeight = 10;
        
        categories.forEach(cat => {
            const score = categoryScores[cat];
            if (score.maxPoints === 0) return;
            
            const percentage = Math.round((score.points / score.maxPoints) * 100);
            
            // Category name (left aligned)
            doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(categoryNames[cat], x, currentY);
            
            // Progress bar (middle)
            const barX = x + 35;
            const miniBarHeight = 4;
            doc.setFillColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
            drawRoundedRect(barX, currentY - 3, barWidth, miniBarHeight, 1, true);
            
            const miniProgressWidth = (barWidth * percentage) / 100;
            const color = percentage >= 70 ? COLORS.success : percentage >= 40 ? COLORS.warning : COLORS.danger;
            doc.setFillColor(color.r, color.g, color.b);
            drawRoundedRect(barX, currentY - 3, miniProgressWidth, miniBarHeight, 1, true);
            
            // Score (right aligned)
            doc.setFontSize(8);
            doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
            doc.text(`${score.points}/${score.maxPoints}`, barX + barWidth + 5, currentY);
            
            currentY += rowHeight;
        });
        
        return currentY;
    };

    // ========== PAGE 1: COVER PAGE ==========
    
    // Gradient header
    drawGradientHeader(0, 80);
    
    // Logo/Title area
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('RepoView', pageWidth / 2, 35, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Portfolio Analysis Report', pageWidth / 2, 45, { align: 'center' });
    
    // User info card
    const cardY = 100;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
    doc.setLineWidth(0.5);
    drawRoundedRect(margin, cardY, contentWidth, 40, 4, true);
    drawRoundedRect(margin, cardY, contentWidth, 40, 4, false);
    
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('GitHub Username', margin + 10, cardY + 12);
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.text(`@${username}`, margin + 10, cardY + 24);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })}`, margin + 10, cardY + 34);
    
    // Summary stats
    const statsY = cardY + 55;
    const totalRepos = analyses.length;
    const avgScore = Math.round(analyses.reduce((sum, a) => sum + a.percentage, 0) / totalRepos);
    const strongCount = analyses.filter(a => a.tier === 'strong').length;
    
    const statBoxWidth = (contentWidth - 20) / 3;
    
    // Stat box helper
    const drawStatBox = (x: number, y: number, label: string, value: string, color: typeof COLORS.success) => {
        // Use light pastel backgrounds based on color
        let bgColor = { r: 241, g: 245, b: 249 }; // Default light gray
        if (color === COLORS.primary) {
            bgColor = { r: 224, g: 231, b: 255 }; // Light indigo
        } else if (color === COLORS.info) {
            bgColor = { r: 219, g: 234, b: 254 }; // Light blue
        } else if (color === COLORS.success) {
            bgColor = { r: 220, g: 252, b: 231 }; // Light green
        }
        
        doc.setFillColor(bgColor.r, bgColor.g, bgColor.b);
        drawRoundedRect(x, y, statBoxWidth, 30, 3, true);
        
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(color.r, color.g, color.b);
        doc.text(value, x + statBoxWidth / 2, y + 15, { align: 'center' });
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
        doc.text(label, x + statBoxWidth / 2, y + 23, { align: 'center' });
    };
    
    drawStatBox(margin, statsY, 'Repositories', totalRepos.toString(), COLORS.primary);
    drawStatBox(margin + statBoxWidth + 10, statsY, 'Average Score', `${avgScore}%`, COLORS.info);
    drawStatBox(margin + (statBoxWidth + 10) * 2, statsY, 'Strong Tier', strongCount.toString(), COLORS.success);
    
    // ========== REPOSITORY PAGES ==========
    
    analyses.forEach((analysis, index) => {
        doc.addPage();
        let y = margin;
        
        // Repository header
        doc.setFillColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(analysis.repoName, margin, 15);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(analysis.repoUrl, margin, 25);
        
        y = 45;
        
        // Score card
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
        drawRoundedRect(margin, y, contentWidth, 35, 4, true);
        drawRoundedRect(margin, y, contentWidth, 35, 4, false);
        
        // Score percentage (large)
        const tierColor = TIER_COLORS[analysis.tier as keyof typeof TIER_COLORS];
        doc.setFontSize(36);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(tierColor.r, tierColor.g, tierColor.b);
        doc.text(`${analysis.percentage}`, margin + 15, y + 23);
        
        doc.setFontSize(14);
        doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
        doc.text('/100', margin + 35, y + 23);
        
        // Tier badge
        drawBadge(margin + 55, y + 20, analysis.tier.toUpperCase(), tierColor);
        
        // Detailed score
        doc.setFontSize(9);
        doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
        doc.setFont('helvetica', 'normal');
        doc.text(`${analysis.totalScore} out of ${analysis.maxScore} points`, margin + 15, y + 30);
        
        // Progress bar
        drawProgressBar(margin + 90, y + 15, contentWidth - 110, analysis.percentage, analysis.tier);
        
        y += 45;
        
        // Category breakdown section
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
        doc.text('Category Breakdown', margin, y);
        y += 8;
        
        y = drawCategoryBreakdown(margin, y, analysis.checks);
        y += 5;
        
        // Strengths section
        if (analysis.strengths.length > 0) {
            doc.setFillColor(220, 252, 231); // Light green background
            const strengthsHeight = Math.min(analysis.strengths.length * 6 + 12, 50);
            drawRoundedRect(margin, y, contentWidth, strengthsHeight, 3, true);
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(COLORS.success.r, COLORS.success.g, COLORS.success.b);
            doc.text('Strengths', margin + 8, y + 8);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(22, 101, 52); // Dark green text
            
            let strengthY = y + 15;
            analysis.strengths.slice(0, 6).forEach(strength => {
                doc.text(`• ${strength}`, margin + 10, strengthY);
                strengthY += 6;
            });
            
            y += strengthsHeight + 8;
        }
        
        // Weaknesses section
        if (analysis.weaknesses.length > 0 && y < pageHeight - 60) {
            doc.setFillColor(254, 226, 226); // Light red background
            const weaknessesHeight = Math.min(analysis.weaknesses.length * 6 + 12, 50);
            drawRoundedRect(margin, y, contentWidth, weaknessesHeight, 3, true);
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(COLORS.danger.r, COLORS.danger.g, COLORS.danger.b);
            doc.text('Areas for Improvement', margin + 8, y + 8);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(127, 29, 29); // Dark red text
            
            let weaknessY = y + 15;
            analysis.weaknesses.slice(0, 6).forEach(weakness => {
                doc.text(`• ${weakness}`, margin + 10, weaknessY);
                weaknessY += 6;
            });
            
            y += weaknessesHeight + 8;
        }
        
        // Suggestions section
        if (analysis.suggestions.length > 0 && y < pageHeight - 60) {
            doc.setFillColor(219, 234, 254); // Light blue background
            const suggestionsHeight = Math.min(analysis.suggestions.length * 10 + 12, 60);
            drawRoundedRect(margin, y, contentWidth, suggestionsHeight, 3, true);
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(COLORS.info.r, COLORS.info.g, COLORS.info.b);
            doc.text('Recommendations', margin + 8, y + 8);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(30, 58, 138); // Dark blue text
            
            let suggestionY = y + 15;
            analysis.suggestions.slice(0, 4).forEach(suggestion => {
                const lines = doc.splitTextToSize(`• ${suggestion}`, contentWidth - 20);
                lines.forEach((line: string) => {
                    if (suggestionY < y + suggestionsHeight - 5) {
                        doc.text(line, margin + 10, suggestionY);
                        suggestionY += 5;
                    }
                });
            });
        }
        
        // Footer on each page
        doc.setFontSize(7);
        doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
        doc.text(`Page ${index + 2} of ${analyses.length + 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('Generated by RepoView', margin, pageHeight - 10);
    });
    
    // Footer on cover page
    doc.setPage(1);
    doc.setFontSize(8);
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    doc.text('No AI was used in this analysis - 100% rule-based evaluation', pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text('repoview.dev', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Return as buffer
    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
}
