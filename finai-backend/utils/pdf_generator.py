"""
pdf_generator.py — ReportLab-based PDF report generator for FinAI retirement reports.
"""

import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

# ── Brand colours ────────────────────────────────────────────────────────────
PRIMARY    = colors.HexColor("#1a56db")   # deep blue
SECONDARY  = colors.HexColor("#1e429f")   # darker blue
ACCENT     = colors.HexColor("#3f83f8")   # lighter blue
SUCCESS    = colors.HexColor("#057a55")   # green
WARNING    = colors.HexColor("#c27803")   # amber
LIGHT_BG   = colors.HexColor("#f0f4ff")   # very light blue
HEADER_BG  = colors.HexColor("#1a56db")
ROW_ALT    = colors.HexColor("#f8faff")
BORDER     = colors.HexColor("#c3d3f5")
TEXT_DARK  = colors.HexColor("#111827")
TEXT_MID   = colors.HexColor("#374151")
TEXT_LIGHT = colors.HexColor("#6b7280")
WHITE      = colors.white


def _styles():
    base = getSampleStyleSheet()

    custom = {
        "ReportTitle": ParagraphStyle(
            "ReportTitle",
            parent=base["Title"],
            fontSize=24,
            textColor=WHITE,
            spaceAfter=4,
            alignment=TA_CENTER,
            fontName="Helvetica-Bold",
        ),
        "ReportSubtitle": ParagraphStyle(
            "ReportSubtitle",
            parent=base["Normal"],
            fontSize=11,
            textColor=colors.HexColor("#bfdbfe"),
            alignment=TA_CENTER,
            fontName="Helvetica",
        ),
        "SectionHeading": ParagraphStyle(
            "SectionHeading",
            parent=base["Heading2"],
            fontSize=13,
            textColor=SECONDARY,
            spaceBefore=14,
            spaceAfter=6,
            fontName="Helvetica-Bold",
            borderPad=0,
        ),
        "BodyText": ParagraphStyle(
            "BodyText",
            parent=base["Normal"],
            fontSize=10,
            textColor=TEXT_MID,
            leading=15,
            fontName="Helvetica",
        ),
        "Disclaimer": ParagraphStyle(
            "Disclaimer",
            parent=base["Normal"],
            fontSize=7.5,
            textColor=TEXT_LIGHT,
            leading=11,
            fontName="Helvetica",
            alignment=TA_CENTER,
        ),
        "InsightBullet": ParagraphStyle(
            "InsightBullet",
            parent=base["Normal"],
            fontSize=10,
            textColor=TEXT_DARK,
            leading=14,
            fontName="Helvetica",
            leftIndent=10,
        ),
        "FooterText": ParagraphStyle(
            "FooterText",
            parent=base["Normal"],
            fontSize=8,
            textColor=TEXT_LIGHT,
            alignment=TA_CENTER,
            fontName="Helvetica",
        ),
    }
    return custom


def _fmt_inr(amount: float) -> str:
    """Format a number as Indian Rupees with lakh/crore suffix."""
    amount = float(amount)
    if amount >= 1_00_00_000:
        return f"₹{amount / 1_00_00_000:.2f} Cr"
    elif amount >= 1_00_000:
        return f"₹{amount / 1_00_000:.2f} L"
    else:
        return f"₹{amount:,.0f}"


def _header_flowable(styles, user_data: dict):
    """Render a coloured header banner."""
    generated_on = datetime.now().strftime("%d %B %Y, %I:%M %p")
    elements = []

    # Blue banner table (simulated with a 1-cell table)
    header_data = [[
        Paragraph("FinAI Retirement Planning Report", styles["ReportTitle"]),
    ]]
    sub_data = [[
        Paragraph(f"Generated on {generated_on}", styles["ReportSubtitle"]),
    ]]

    banner = Table(header_data, colWidths=["100%"])
    banner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PRIMARY),
        ("TOPPADDING",    (0, 0), (-1, -1), 18),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",   (0, 0), (-1, -1), 12),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
    ]))

    sub_banner = Table(sub_data, colWidths=["100%"])
    sub_banner.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), PRIMARY),
        ("TOPPADDING",    (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 18),
        ("LEFTPADDING",   (0, 0), (-1, -1), 12),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
    ]))

    elements.extend([banner, sub_banner, Spacer(1, 10)])
    return elements


def _profile_table(styles, user_data: dict):
    """User profile section."""
    elements = [Paragraph("User Profile", styles["SectionHeading"])]

    risk_labels = {
        "conservative": "Conservative 🛡️",
        "moderate":      "Moderate ⚖️",
        "aggressive":    "Aggressive 🚀",
    }
    risk = risk_labels.get(str(user_data.get("risk_profile", "")).lower(),
                            str(user_data.get("risk_profile", "N/A")).title())

    years_to_retire = int(user_data.get("retirement_age", 60)) - int(user_data.get("age", 30))
    monthly_savings = float(user_data.get("monthly_income", 0)) - float(user_data.get("monthly_expense", 0))
    savings_rate = (monthly_savings / float(user_data.get("monthly_income", 1)) * 100) if user_data.get("monthly_income") else 0

    rows = [
        ["Parameter", "Value", "Parameter", "Value"],
        ["Current Age",       f"{user_data.get('age', 'N/A')} yrs",
         "Retirement Age",    f"{user_data.get('retirement_age', 'N/A')} yrs"],
        ["Years to Retire",   f"{years_to_retire} yrs",
         "Risk Profile",      risk],
        ["Monthly Income",    _fmt_inr(user_data.get("monthly_income", 0)),
         "Monthly Expense",   _fmt_inr(user_data.get("monthly_expense", 0))],
        ["Monthly Savings",   _fmt_inr(monthly_savings),
         "Savings Rate",      f"{savings_rate:.1f}%"],
        ["Existing Corpus",   _fmt_inr(user_data.get("existing_savings", 0)),
         "",                  ""],
    ]

    col_w = [45*mm, 45*mm, 45*mm, 45*mm]
    t = Table(rows, colWidths=col_w)
    t.setStyle(TableStyle([
        # Header row
        ("BACKGROUND",    (0, 0), (-1, 0), SECONDARY),
        ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0), 10),
        ("ALIGN",         (0, 0), (-1, 0), "CENTER"),
        # Data rows
        ("FONTNAME",      (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",      (0, 1), (-1, -1), 9),
        ("TEXTCOLOR",     (0, 1), (-1, -1), TEXT_DARK),
        # Label columns
        ("FONTNAME",      (0, 1), (0, -1), "Helvetica-Bold"),
        ("FONTNAME",      (2, 1), (2, -1), "Helvetica-Bold"),
        ("TEXTCOLOR",     (0, 1), (0, -1), TEXT_MID),
        ("TEXTCOLOR",     (2, 1), (2, -1), TEXT_MID),
        # Alternating row bg
        *[("BACKGROUND", (0, i), (-1, i), ROW_ALT if i % 2 == 0 else WHITE)
          for i in range(1, len(rows))],
        ("BACKGROUND",    (0, len(rows)-1), (-1, len(rows)-1),
         ROW_ALT if (len(rows)-1) % 2 == 0 else WHITE),
        # Grid
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("ROWBACKGROUND", (0, 0), (-1, 0), SECONDARY),
        # Padding
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(t)
    return elements


def _scenario_table(styles, scenario_results: list):
    """Scenario comparison table."""
    if not scenario_results:
        return []

    elements = [
        Spacer(1, 6),
        Paragraph("Scenario Comparison", styles["SectionHeading"]),
    ]

    headers = ["Scenario", "Projected Corpus", "Monthly SIP", "XIRR (%)", "Feasibility"]
    rows = [headers]

    for s in scenario_results:
        rows.append([
            str(s.get("scenario_name", "—")),
            _fmt_inr(s.get("projected_corpus", 0)),
            _fmt_inr(s.get("monthly_sip", 0)),
            f"{float(s.get('xirr', 0)):.1f}%",
            str(s.get("feasibility", "—")),
        ])

    col_w = [38*mm, 40*mm, 36*mm, 28*mm, 38*mm]
    t = Table(rows, colWidths=col_w, repeatRows=1)
    t.setStyle(TableStyle([
        # Header
        ("BACKGROUND",    (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR",     (0, 0), (-1, 0), WHITE),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, 0), 9),
        ("ALIGN",         (0, 0), (-1, 0), "CENTER"),
        # Body
        ("FONTNAME",      (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",      (0, 1), (-1, -1), 9),
        ("TEXTCOLOR",     (0, 1), (-1, -1), TEXT_DARK),
        ("ALIGN",         (1, 1), (-1, -1), "CENTER"),
        ("ALIGN",         (0, 1), (0, -1), "LEFT"),
        # Alternating rows
        *[("BACKGROUND", (0, i), (-1, i), ROW_ALT if i % 2 == 0 else WHITE)
          for i in range(1, len(rows))],
        ("GRID",          (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(t)
    return elements


def _insights_section(styles, user_data: dict, scenario_results: list):
    """Auto-generated key insights."""
    elements = [
        Spacer(1, 6),
        Paragraph("Key Insights", styles["SectionHeading"]),
    ]

    insights = []
    age         = int(user_data.get("age", 30))
    retire_age  = int(user_data.get("retirement_age", 60))
    income      = float(user_data.get("monthly_income", 0))
    expense     = float(user_data.get("monthly_expense", 0))
    savings     = float(user_data.get("existing_savings", 0))
    years_left  = retire_age - age

    monthly_surplus = income - expense
    savings_rate    = (monthly_surplus / income * 100) if income else 0

    insights.append(
        f"You have <b>{years_left} years</b> until your planned retirement at age <b>{retire_age}</b>. "
        f"Starting early gives compounding maximum time to work in your favour."
    )

    if savings_rate >= 30:
        insights.append(
            f"Your savings rate of <b>{savings_rate:.1f}%</b> is excellent. "
            f"Maintaining this discipline will significantly accelerate corpus growth."
        )
    elif savings_rate >= 15:
        insights.append(
            f"Your savings rate is <b>{savings_rate:.1f}%</b>. "
            f"Increasing it by even 5% could add lakhs to your retirement corpus."
        )
    else:
        insights.append(
            f"Your current savings rate of <b>{savings_rate:.1f}%</b> is low. "
            f"Review discretionary expenses to free up more for investments."
        )

    if savings > 0:
        insights.append(
            f"Your existing corpus of <b>{_fmt_inr(savings)}</b> is a strong head-start. "
            f"At 10% p.a. it will grow to <b>{_fmt_inr(savings * (1.10 ** years_left))}</b> by retirement — "
            f"even before any new SIPs."
        )

    if scenario_results:
        best = max(scenario_results,
                   key=lambda s: float(s.get("projected_corpus", 0)))
        insights.append(
            f"The <b>{best.get('scenario_name', 'best')}</b> scenario projects the highest corpus of "
            f"<b>{_fmt_inr(best.get('projected_corpus', 0))}</b> with an XIRR of "
            f"<b>{float(best.get('xirr', 0)):.1f}%</b>."
        )

    insights.append(
        "Revisit this plan annually or after major life events (salary hike, marriage, home purchase) "
        "to keep your retirement strategy on track."
    )

    # Render as a light-blue insight box
    insight_rows = [[Paragraph(f"• {i}", styles["InsightBullet"])] for i in insights]
    box = Table(insight_rows, colWidths=["100%"])
    box.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), LIGHT_BG),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 12),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 12),
        ("BOX",           (0, 0), (-1, -1), 1, BORDER),
        ("LINEABOVE",     (0, 0), (-1, 0),  2, ACCENT),
    ]))
    elements.append(box)
    return elements


def _disclaimer(styles):
    text = (
        "DISCLAIMER: This report is generated for informational purposes only and does not constitute "
        "financial, investment, or legal advice. Projections are based on assumed rates of return and "
        "may not reflect actual market conditions. Past performance is not indicative of future results. "
        "Please consult a SEBI-registered investment adviser before making investment decisions. "
        "FinAI and its affiliates are not liable for any investment decisions made based on this report."
    )
    elements = [
        Spacer(1, 16),
        HRFlowable(width="100%", thickness=0.5, color=BORDER),
        Spacer(1, 6),
        Paragraph(text, styles["Disclaimer"]),
    ]
    return elements


def generate_retirement_report(user_data: dict, scenario_results: list) -> bytes:
    """
    Generate a styled retirement planning PDF report.

    Args:
        user_data:        Dict with age, retirement_age, monthly_income, monthly_expense,
                          existing_savings, risk_profile.
        scenario_results: List of dicts with scenario_name, projected_corpus,
                          monthly_sip, xirr, feasibility.

    Returns:
        PDF as bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18*mm,
        leftMargin=18*mm,
        topMargin=16*mm,
        bottomMargin=20*mm,
        title="FinAI Retirement Planning Report",
        author="FinAI",
    )

    styles   = _styles()
    story    = []

    story.extend(_header_flowable(styles, user_data))
    story.extend(_profile_table(styles, user_data))
    story.extend(_scenario_table(styles, scenario_results))
    story.extend(_insights_section(styles, user_data, scenario_results))
    story.extend(_disclaimer(styles))

    doc.build(story)
    return buffer.getvalue()