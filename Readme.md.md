## **Název projektu**

**The Binding of Isaac: Repentance+**

## **Žák**
Václav Žežulka

## **Stručný popis tématu (3–5 vět)**

Tento projekt slouží jako komplexní dokumentace, průvodce a nástroj pro správu modifikací pro hru **The Binding of Isaac: Repentance** s plánovaným rozšířením funkčnosti pro modifikace (označeno jako "+"). Cílem je poskytnout hráčům rychlý přístup k informacím o předmětech, nepřátelích a postavách ve hře a zároveň nabídnout jednoduchý návod pro aktivaci a deaktivaci modů. Projekt se zaměřuje na dynamické načítání herních dat a uživatelsky přívětivé vyhledávání.

## **Cílová skupina**

Hráči hry The Binding of Isaac: Repentance, kteří hledají **rychlé informace** o herních mechanikách, **statistikách** předmětů nebo potřebují **jednoduchý správce modů** pro optimalizaci svého herního zážitku.

## **Návrh obsahových sekcí**

1.  **Databáze předmětů (Items)** – Dynamicky načítaný seznam všech herních předmětů s popisy, efekty a statistikami.

2.  **Bestiář (Bestiary)** – Seznam nepřátel a bossů s jejich chováním, HP a tipy pro boj.

3.  **Postavy (Characters)** – Přehled hratelných postav, jejich startovní předměty a odemknutelné předměty.

4.  **Správce Modů (Mod Manager)** – Rozhraní pro správu nainstalovaných workshop modifikací (aktivace/deaktivace, informace o modu).

5.  **Průvodce hrou (Game Guide)** – Základní informace o mechanikách, synergiích a skrytých místnostech.

---

## **Návrh designu / wireframe**

-   **Barevné ladění:** Tmavý, komunitou oblíbený vzhled (tmavě červená, černá, šedá) s akcenty v barvách ikon předmětů.
-   **Uspořádání:** Levé navigační menu pro rychlý přístup k sekcím. Hlavní obsahová část s funkcí vyhledávání a filtrování.
-   **Karty předmětů/nepřátel:** Přehledné karty s ikonou, krátkým popisem a rozbalitelnými detaily (grid uspořádání).

## **Použité technologie**

-   **Frontend:** HTML, CSS, JavaScript (Možná použití framewotku SASS/SCSS pro jednodušší zapisování a skrukturování kódu).
-   **Data:** JSON soubory pro kompletní databázi předmětů, nepřátel a postav (simulace databáze).
-   **AJAX/Fetch API:** Načítání a filtrování dat v reálném čase.
-   **Backend:** Jednoduchý Python/Node.js/PHP skript pro **simulaci interakce** se složkou s mody nebo pro odeslání **simulovaného reportu chyby**.
-   **Verzování:** Git + GitHub.

---

## **Očekávaný přínos / co se naučím**

-   Práce s rozsáhlými JSON datovými sadami (databáze herních předmětů a nepřátel).
-   Dynamické vykreslování dat s funkcí pokročilého vyhledávání a filtrování pomocí JavaScriptu.
-   Tvorba komplexního a interaktivního UI pro správu obsahu (simulace Správce Modů).
-   Organizace projektu s modulárním kódem pro snadnou údržbu a přidávání nových herních rozšíření.
-   Verzování projektu přes Git/GitHub a psaní kvalitní dokumentace (README).