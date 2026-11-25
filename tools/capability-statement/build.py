"""Build the one-page capability statement PDFs (English and French) from site data.

Usage (from the repo root): python3 tools/capability-statement/build.py
Needs Playwright with Chrome. Writes public/documents/heart-cadence-capability-statement-en.pdf
and public/documents/heart-cadence-enonce-de-capacites-fr.pdf.
"""
import pathlib, re, html
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
FONTS = ROOT / "node_modules/@fontsource-variable"
LOGO = (ROOT / "public/images/heart-cadence-logo-colour.svg").read_text()

def site_codes():
    s = (ROOT / "src/site.ts").read_text()
    unspsc = re.findall(r"code: '(\d{8})', en: '([^']+)', fr: '([^']+)'", s)
    naics = re.findall(r"code: '(\d{6})', en: '([^']+)', fr: '([^']+)'", s)
    return unspsc, naics

T = {
 "en": dict(
  file="heart-cadence-capability-statement-en.pdf", lang="en", title="Capability Statement", date="November 2026",
  intro="Heart Cadence Inc. (HCI) helps Canadian businesses choose, set up and run the phone, contact centre, network, security and service desk tools their teams and customers rely on. We also help vendors become Government-ready and submit stronger bids.",
  comp_h="Core competencies",
  comp=["Customer experience and journey design","Service desk and IT service management (ITSM)","Business phones (UCaaS) and contact centre (CCaaS)","Networks and connectivity","Cybersecurity","Cloud and infrastructure","Mobility and IoT","Government procurement readiness and bids"],
  apart_h="What sets us apart",
  apart=[("Not tied to one brand.","We compare 400+ technology providers and recommend what fits."),
         ("Execution, not just advice.","We manage the setup with your team and stay your point of contact."),
         ("Certified service management.","ITIL 4 Foundation, ITIL 4 Specialist: Create, Deliver and Support, and ITIL 4 Strategist: Direct, Plan and Improve."),
         ("Plain language.","Clear documents that are easy to evaluate and easy to trust.")],
  team_h="Team",
  team=[("Jason K. McEwan","Founder and Principal Consultant. About 20 years in IT, with deep expertise in service desk and ITSM. ITIL 4 certified."),
        ("Rory Stennett","Director, Client Experience and Growth. Customer experience and journey design.")],
  codes_h="Codes", naics_l="NAICS (Canada 2022)", unspsc_l="UNSPSC",
  dont_h="What we don’t do", dont="No lobbying. No promises of contract wins. No claims of insider access or Government connections.",
  data_h="Company data",
  data=[("Legal name","Heart Cadence Inc."),("PBN","794978619PG0001"),("Location","Brantford, Ontario"),("Service area","Across Canada"),("Language of service","English"),("Partners","Authorized ManageEngine reseller"),("Website","heartcadence.com"),("Email","info@heartcadence.com")],
  reg_h="Registration status",
  reg=[("Procurement Business Number","Issued"),("Contract Security Program clearance","Planned"),("Supply arrangements (TBIPS, ProServices)","Planned"),("Black business certification (BEBC)","Planned")],
  past_h="Past performance", past="HCI is a new company. We have no completed Government contracts to list yet. We will add them as they happen.",
 ),
 "fr": dict(
  file="heart-cadence-enonce-de-capacites-fr.pdf", lang="fr", title="Énoncé de capacités", date="Novembre 2026",
  intro="Heart Cadence Inc. (HCI) aide les entreprises canadiennes à choisir, mettre en place et gérer les outils de téléphonie, de centre de contact, de réseau, de sécurité et de centre de services sur lesquels comptent leurs équipes et leurs clients. Nous aidons aussi les fournisseurs à se préparer aux marchés publics et à présenter de meilleures soumissions.",
  comp_h="Compétences principales",
  comp=["Expérience client et parcours client","Centre de services et gestion des services TI (ITSM)","Téléphonie d’affaires (UCaaS) et centre de contact (CCaaS)","Réseaux et connectivité","Cybersécurité","Infonuagique et infrastructure","Mobilité et IdO","Préparation aux marchés publics et soumissions"],
  apart_h="Ce qui nous distingue",
  apart=[("Aucune marque imposée.","Nous comparons plus de 400 fournisseurs de technologie et recommandons ce qui convient."),
         ("De l’action, pas seulement des conseils.","Nous gérons la mise en place avec votre équipe et restons votre personne-ressource."),
         ("Gestion des services certifiée.","ITIL 4 Foundation, ITIL 4 Specialist: Create, Deliver and Support et ITIL 4 Strategist: Direct, Plan and Improve."),
         ("Langage clair.","Des documents clairs, faciles à évaluer et dignes de confiance.")],
  team_h="Équipe",
  team=[("Jason K. McEwan","Fondateur et consultant principal. Environ 20 ans en TI, avec une expertise poussée en centre de services et ITSM. Certifié ITIL 4."),
        ("Rory Stennett","Directeur, expérience client et croissance. Expérience client et conception du parcours client.")],
  codes_h="Codes", naics_l="SCIAN (Canada 2022)", unspsc_l="UNSPSC",
  dont_h="Ce que nous ne faisons pas", dont="Aucun lobbying. Aucune promesse d’obtention de contrats. Aucune prétention d’accès privilégié ou de relations au sein du gouvernement.",
  data_h="Données de l’entreprise",
  data=[("Raison sociale","Heart Cadence Inc."),("NEA","794978619PG0001"),("Emplacement","Brantford (Ontario)"),("Territoire","Partout au Canada"),("Langue de service","Anglais"),("Partenaires","Revendeur autorisé ManageEngine"),("Site Web","heartcadence.com"),("Courriel","info@heartcadence.com")],
  reg_h="État des inscriptions",
  reg=[("Numéro d’entreprise-approvisionnement","Obtenu"),("Habilitation du Programme de sécurité des contrats","Prévue"),("Arrangements en matière d’approvisionnement (SPICT, ProServices)","Prévus"),("Certification d’entreprise noire (BEBC)","Prévue")],
  past_h="Rendement antérieur", past="HCI est une nouvelle entreprise. Nous n’avons pas encore de contrats gouvernementaux terminés à présenter. Nous les ajouterons au fur et à mesure.",
 ),
}

CSS = """
@font-face{font-family:'Inter';src:url('__INTER__') format('woff2');font-weight:100 900}
@font-face{font-family:'SourceSerif';src:url('__SERIF__') format('woff2');font-weight:200 900}
@page{size:Letter;margin:0}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,Arial,sans-serif;color:#1E2329;font-size:8.6pt;line-height:1.35}
.page{width:8.5in;height:11in;position:relative;padding:0.42in 0.5in 0.7in}
.top{display:flex;justify-content:space-between;align-items:flex-start}
.top svg{width:2.05in;height:auto}
.contact{text-align:right;font-size:8pt;line-height:1.45;color:#3B5B7A}.contact b{color:#0F2A44}
h1{font-family:SourceSerif,Georgia,serif;font-weight:650;color:#0F2A44;font-size:24pt;margin:.18in 0 .04in}
.intro{font-size:9.6pt;margin:0 0 .14in;max-width:7.4in}
.cols{display:grid;grid-template-columns:1fr 2.75in;gap:.25in}
h2{font-family:SourceSerif,Georgia,serif;font-weight:650;color:#0F2A44;font-size:11pt;margin:.12in 0 .06in;padding-bottom:3px;border-bottom:1.5px solid #B4472F}
ul{margin:0;padding-left:13px}li{margin:0 0 2px}
.comp{columns:2;column-gap:.2in}.comp li{break-inside:avoid}
.apart b,.team b{color:#0F2A44}
.team p{margin:0 0 4px}
.codes{font-size:7.6pt}.codes .lbl{font-weight:650;color:#0F2A44;margin-top:3px}
.codes table{border-collapse:collapse;width:100%}.codes td{padding:1px 6px 1px 0;vertical-align:top}.codes td:first-child{font-variant-numeric:tabular-nums;white-space:nowrap;color:#3B5B7A}
.side{border:1px solid #E6E1D8;border-radius:8px;padding:.04in .16in .14in;background:#FFFFFF}
.kv{width:100%;border-collapse:collapse;font-size:8pt}.kv td{padding:2.5px 0;border-bottom:1px solid #EEE9E1;vertical-align:top}.kv td:first-child{font-weight:650;color:#0F2A44;width:42%;padding-right:6px}
.st td:last-child{text-align:right;font-weight:650;color:#2F7D79;white-space:nowrap;padding-left:6px}.st td:first-child{font-weight:400;color:#1E2329;width:auto}
.foot{position:absolute;left:0;right:0;bottom:0;height:.5in;background:#0F2A44;color:#fff;font-size:8pt;display:flex;align-items:center;padding:0 .5in}
"""

def build(lang, unspsc, naics):
    t = T[lang]
    e = html.escape
    li = lambda xs: "".join(f"<li>{e(x)}</li>" for x in xs)
    css = CSS.replace("__INTER__", (FONTS / "inter/files/inter-latin-wght-normal.woff2").as_uri()).replace(
        "__SERIF__", (FONTS / "source-serif-4/files/source-serif-4-latin-wght-normal.woff2").as_uri())
    codes_naics = "".join(f"<tr><td>{c}</td><td>{e(en if lang=='en' else fr)}</td></tr>" for c, en, fr in naics)
    codes_unspsc = ", ".join(c for c, _, _ in unspsc)
    side_kv = "".join(f"<tr><td>{e(k)}</td><td>{e(v)}</td></tr>" for k, v in t["data"])
    side_reg = "".join(f"<tr><td>{e(k)}</td><td>{e(v)}</td></tr>" for k, v in t["reg"])
    doc = f"""<!doctype html><html lang="{t['lang']}"><head><meta charset="utf-8"><title>Heart Cadence Inc. {e(t['title'])}</title><style>{css}</style></head><body><div class="page">
<div class="top">{LOGO}<div class="contact"><b>PBN 794978619PG0001</b><br>info@heartcadence.com<br>heartcadence.com<br>{e(t['date'])}</div></div>
<h1>{e(t['title'])}</h1><p class="intro">{e(t['intro'])}</p>
<div class="cols"><div>
<h2>{e(t['comp_h'])}</h2><ul class="comp">{li(t['comp'])}</ul>
<h2>{e(t['apart_h'])}</h2><ul class="apart">{''.join(f'<li><b>{e(a)}</b> {e(b)}</li>' for a,b in t['apart'])}</ul>
<h2>{e(t['team_h'])}</h2><div class="team">{''.join(f'<p><b>{e(a)}</b><br>{e(b)}</p>' for a,b in t['team'])}</div>
<h2>{e(t['codes_h'])}</h2><div class="codes"><div class="lbl">{e(t['naics_l'])}</div><table>{codes_naics}</table>
<div class="lbl" style="margin-top:5px">{e(t['unspsc_l'])}</div><div>{codes_unspsc}</div></div>
<h2>{e(t['dont_h'])}</h2><p style="margin:0">{e(t['dont'])}</p>
</div><div><div class="side">
<h2>{e(t['data_h'])}</h2><table class="kv">{side_kv}</table>
<h2>{e(t['reg_h'])}</h2><table class="kv st">{side_reg}</table>
<h2>{e(t['past_h'])}</h2><p style="margin:0">{e(t['past'])}</p>
</div></div></div>
<div class="foot">Heart Cadence Inc. · Brantford, Ontario · heartcadence.com · info@heartcadence.com</div>
</div></body></html>"""
    return doc

def main():
    unspsc, naics = site_codes()
    out = ROOT / "public/documents"
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
        for lang in ("en", "fr"):
            htm = ROOT / f"tools/capability-statement/{lang}.html"
            htm.write_text(build(lang, unspsc, naics))
            pg = b.new_page()
            pg.goto(htm.as_uri()); pg.wait_for_timeout(500)
            h = pg.evaluate("document.querySelector('.page').scrollHeight")
            pg.pdf(path=str(out / T[lang]["file"]), format="Letter", print_background=True, prefer_css_page_size=True)
            print(lang, "page height px", h)
        b.close()

if __name__ == "__main__":
    main()
