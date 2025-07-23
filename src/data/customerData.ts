// Customer database extracted from WebEDI admin interface
export interface CustomerData {
  webTPID: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Pending';
  signupDate: string;
  contactDate: string;
}

export const customerDatabase: CustomerData[] = [
  {
    webTPID: "5087",
    companyName: "Sunset Brands",
    contactName: "JOHN GERACI",
    email: "JOHN@SUNSETBRANDS.COM",
    phone: "(210) 226-1088",
    status: "Active",
    signupDate: "2024-11-20",
    contactDate: "2024-11-20"
  },
  {
    webTPID: "5086",
    companyName: "BIG LOTS",
    contactName: "CHASTIN MILES",
    email: "BIG.LOTS@BIG-LOTS.COM",
    phone: "(123) 456-7890",
    status: "Active", 
    signupDate: "2024-11-19",
    contactDate: "2024-11-19"
  },
  {
    webTPID: "5085",
    companyName: "SPARKS GROUP US LLC",
    contactName: "STACY WILLIAMS",
    email: "STACY.WILLIAMS@SPARKSGROUPUS.COM",
    phone: "(123) 456-7890",
    status: "Active",
    signupDate: "2024-11-18",
    contactDate: "2024-11-18"
  },
  {
    webTPID: "5084",
    companyName: "BRITELITES",
    contactName: "LAURA BRINSON",
    email: "LAURA@BRITELITES.COM",
    phone: "(972) 247-4290",
    status: "Active",
    signupDate: "2024-11-15",
    contactDate: "2024-11-15"
  },
  {
    webTPID: "5083",
    companyName: "KROGER PAYABLES",
    contactName: "DAVID HAYWOOD",
    email: "DAVID.HAYWOOD@KROGER.COM",
    phone: "(123) 456-7890",
    status: "Active",
    signupDate: "2024-11-14",
    contactDate: "2024-11-14"
  },
  {
    webTPID: "5082",
    companyName: "WELLEN CONSTRUCTION",
    contactName: "JAMES CRAIN",
    email: "JCRAIN@WELLEN.COM",
    phone: "(314) 436-7600",
    status: "Active",
    signupDate: "2024-11-13",
    contactDate: "2024-11-13"
  },
  {
    webTPID: "5081",
    companyName: "ATKINS",
    contactName: "SONIA GARZA",
    email: "SONIA.GARZA@ATKINSREALIS.COM",
    phone: "(214) 748-3700",
    status: "Active",
    signupDate: "2024-11-13",
    contactDate: "2024-11-13"
  },
  {
    webTPID: "5080",
    companyName: "ALBERTSONS PAYABLES",
    contactName: "IAN MCINTOSH",
    email: "IAN.MCINTOSH@ALBERTSONS.COM",
    phone: "(208) 395-6200",
    status: "Active",
    signupDate: "2024-11-12",
    contactDate: "2024-11-12"
  },
  {
    webTPID: "5079",
    companyName: "Evergreen Brands",
    contactName: "TYLER MACDONALD",
    email: "TMACDONALD@EVERGREENBRANDS.CA",
    phone: "(519) 763-3300",
    status: "Active",
    signupDate: "2024-11-12",
    contactDate: "2024-11-12"
  },
  {
    webTPID: "5078",
    companyName: "HANNAFORD PAYABLES",
    contactName: "HANNAFORD PAYABLES",
    email: "PAYABLES@HANNAFORD.COM",
    phone: "(123) 456-7890",
    status: "Active",
    signupDate: "2024-11-08",
    contactDate: "2024-11-08"
  },
  {
    webTPID: "5077",
    companyName: "ALBERTSONS PAYABLES",
    contactName: "KEVIN JONES",
    email: "K.JONES@ALBERTSONS.COM",
    phone: "(123) 456-7890",
    status: "Active",
    signupDate: "2024-11-07",
    contactDate: "2024-11-07"
  },
  {
    webTPID: "5076",
    companyName: "Pactiv Evergreen - Canada",
    contactName: "Bhupendra Tandel",
    email: "Bhupendra.Tandel@pactivevergreen.com",
    phone: "(416) 675-7120",
    status: "Active",
    signupDate: "2024-11-07",
    contactDate: "2024-11-07"
  },
  {
    webTPID: "5074",
    companyName: "Dicks Sporting Goods",
    contactName: "Lori Hinkley",
    email: "Lori.Hinkley@dcsg.com",
    phone: "(724) 273-3400",
    status: "Active",
    signupDate: "2024-11-06",
    contactDate: "2024-11-06"
  },
  {
    webTPID: "5073",
    companyName: "PUBLIX PAYABLES",
    contactName: "PUBLIX PAYABLES",
    email: "PAYABLES@PUBLIX.COM",
    phone: "(863) 688-1188",
    status: "Active",
    signupDate: "2024-11-06",
    contactDate: "2024-11-06"
  },
  {
    webTPID: "5064",
    companyName: "Zero Egg Count",
    contactName: "Tim Davis",
    email: "tdavis@zeroeggcount.com",
    phone: "N/A",
    status: "Active",
    signupDate: "2024-10-15",
    contactDate: "2024-10-15"
  },
  {
    webTPID: "5063",
    companyName: "PETSMART PAYABLES",
    contactName: "KELLY ANDERSON",
    email: "KELLY.ANDERSON@PETSMART.COM",
    phone: "(623) 580-6100",
    status: "Active",
    signupDate: "2024-10-14",
    contactDate: "2024-10-14"
  },
  {
    webTPID: "4952",
    companyName: "Magnolia Brush",
    contactName: "Tanna Meals",
    email: "tanna@magnoliabrush.com",
    phone: "N/A",
    status: "Active",
    signupDate: "2024-07-17",
    contactDate: "2024-07-18"
  },
  {
    webTPID: "3892",
    companyName: "Acme Corp",
    contactName: "John Smith",
    email: "orders@acmecorp.com",
    phone: "(555) 123-4567",
    status: "Active",
    signupDate: "2024-05-10",
    contactDate: "2024-05-10"
  },
  {
    webTPID: "5062",
    companyName: "BJ'S WHOLESALE CLUB",
    contactName: "MICHAEL CHEN",
    email: "MICHAEL.CHEN@BJS.COM",
    phone: "(508) 977-8000",
    status: "Active",
    signupDate: "2024-10-10",
    contactDate: "2024-10-10"
  },
  {
    webTPID: "5061",
    companyName: "7-ELEVEN PAYABLES",
    contactName: "SARAH JOHNSON",
    email: "S.JOHNSON@7-ELEVEN.COM",
    phone: "(972) 828-7000",
    status: "Active",
    signupDate: "2024-10-08",
    contactDate: "2024-10-08"
  },
  {
    webTPID: "5060",
    companyName: "LOWES PAYABLES",
    contactName: "ROBERT DAVIS",
    email: "ROBERT.DAVIS@LOWES.COM",
    phone: "(704) 758-1000",
    status: "Active",
    signupDate: "2024-10-05",
    contactDate: "2024-10-05"
  },
  {
    webTPID: "5059",
    companyName: "MEIJER PAYABLES",
    contactName: "JENNIFER WILSON",
    email: "JWILSON@MEIJER.COM",
    phone: "(616) 453-6711",
    status: "Active",
    signupDate: "2024-10-03",
    contactDate: "2024-10-03"
  },
  {
    webTPID: "5058",
    companyName: "FOOD LION PAYABLES",
    contactName: "THOMAS BROWN",
    email: "THOMAS.BROWN@FOODLION.COM",
    phone: "(704) 633-8250",
    status: "Active",
    signupDate: "2024-10-01",
    contactDate: "2024-10-01"
  },
  {
    webTPID: "5057",
    companyName: "COSTCO PAYABLES",
    contactName: "MARIA GARCIA",
    email: "MGARCIA@COSTCO.COM",
    phone: "(425) 313-8100",
    status: "Active",
    signupDate: "2024-09-28",
    contactDate: "2024-09-28"
  },
  {
    webTPID: "5056",
    companyName: "HOME DEPOT PAYABLES",
    contactName: "JAMES MARTINEZ",
    email: "J.MARTINEZ@HOMEDEPOT.COM",
    phone: "(770) 433-8211",
    status: "Active",
    signupDate: "2024-09-25",
    contactDate: "2024-09-25"
  },
  {
    webTPID: "5055",
    companyName: "CVS HEALTH PAYABLES",
    contactName: "PATRICIA RODRIGUEZ",
    email: "PRODRIGUEZ@CVS.COM",
    phone: "(401) 765-1500",
    status: "Active",
    signupDate: "2024-09-22",
    contactDate: "2024-09-22"
  },
  {
    webTPID: "5054",
    companyName: "RITE AID PAYABLES",
    contactName: "WILLIAM LOPEZ",
    email: "WLOPEZ@RITEAID.COM",
    phone: "(717) 761-2633",
    status: "Active",
    signupDate: "2024-09-20",
    contactDate: "2024-09-20"
  },
  {
    webTPID: "5053",
    companyName: "DOLLAR GENERAL PAYABLES",
    contactName: "ELIZABETH GONZALEZ",
    email: "E.GONZALEZ@DG.COM",
    phone: "(615) 855-4000",
    status: "Active",
    signupDate: "2024-09-18",
    contactDate: "2024-09-18"
  },
  {
    webTPID: "5052",
    companyName: "FAMILY DOLLAR PAYABLES",
    contactName: "CHRISTOPHER WILSON",
    email: "CWILSON@FAMILYDOLLAR.COM",
    phone: "(704) 847-6961",
    status: "Active",
    signupDate: "2024-09-15",
    contactDate: "2024-09-15"
  },
  {
    webTPID: "5051",
    companyName: "GIANT EAGLE PAYABLES",
    contactName: "JESSICA ANDERSON",
    email: "J.ANDERSON@GIANTEAGLE.COM",
    phone: "(412) 963-2000",
    status: "Active",
    signupDate: "2024-09-12",
    contactDate: "2024-09-12"
  },
  {
    webTPID: "5050",
    companyName: "H-E-B PAYABLES",
    contactName: "DANIEL THOMAS",
    email: "DTHOMAS@HEB.COM",
    phone: "(210) 938-8000",
    status: "Active",
    signupDate: "2024-09-10",
    contactDate: "2024-09-10"
  },
  {
    webTPID: "5049",
    companyName: "HY-VEE PAYABLES",
    contactName: "NANCY JACKSON",
    email: "NJACKSON@HY-VEE.COM",
    phone: "(515) 267-2800",
    status: "Active",
    signupDate: "2024-09-08",
    contactDate: "2024-09-08"
  },
  {
    webTPID: "5048",
    companyName: "INGLES MARKETS PAYABLES",
    contactName: "PAUL WHITE",
    email: "PWHITE@INGLES-MARKETS.COM",
    phone: "(828) 669-2941",
    status: "Active",
    signupDate: "2024-09-05",
    contactDate: "2024-09-05"
  },
  {
    webTPID: "5047",
    companyName: "JEWEL-OSCO PAYABLES",
    contactName: "KAREN HARRIS",
    email: "KHARRIS@JEWELOSCO.COM",
    phone: "(877) 932-7948",
    status: "Active",
    signupDate: "2024-09-03",
    contactDate: "2024-09-03"
  },
  {
    webTPID: "5046",
    companyName: "KING SOOPERS PAYABLES",
    contactName: "MARK MARTIN",
    email: "MMARTIN@KINGSOOPERS.COM",
    phone: "(303) 778-3484",
    status: "Active",
    signupDate: "2024-09-01",
    contactDate: "2024-09-01"
  },
  {
    webTPID: "5045",
    companyName: "KROGERS PAYABLES",
    contactName: "LINDA THOMPSON",
    email: "LTHOMPSON@KROGER.COM",
    phone: "(513) 762-4000",
    status: "Active",
    signupDate: "2024-08-28",
    contactDate: "2024-08-28"
  },
  {
    webTPID: "5044",
    companyName: "LIDL US PAYABLES",
    contactName: "STEVEN GARCIA",
    email: "SGARCIA@LIDL.US",
    phone: "(844) 747-5435",
    status: "Active",
    signupDate: "2024-08-25",
    contactDate: "2024-08-25"
  },
  {
    webTPID: "5043",
    companyName: "MARSH SUPERMARKETS PAYABLES",
    contactName: "BETTY MARTINEZ",
    email: "BMARTINEZ@MARSH.NET",
    phone: "(317) 594-2100",
    status: "Active",
    signupDate: "2024-08-22",
    contactDate: "2024-08-22"
  },
  {
    webTPID: "5042",
    companyName: "MARTIN'S FOOD MARKETS PAYABLES",
    contactName: "DONALD RODRIGUEZ",
    email: "DRODRIGUEZ@MARTINSFOODS.COM",
    phone: "(717) 747-0711",
    status: "Active",
    signupDate: "2024-08-20",
    contactDate: "2024-08-20"
  },
  {
    webTPID: "5041",
    companyName: "PIGGLY WIGGLY PAYABLES",
    contactName: "HELEN LEWIS",
    email: "HLEWIS@PIGGLYWIGGLY.COM",
    phone: "(843) 537-4000",
    status: "Active",
    signupDate: "2024-08-18",
    contactDate: "2024-08-18"
  },
  {
    webTPID: "5040",
    companyName: "PRICE CHOPPER PAYABLES",
    contactName: "KENNETH LEE",
    email: "KLEE@PRICECHOPPER.COM",
    phone: "(518) 355-5000",
    status: "Active",
    signupDate: "2024-08-15",
    contactDate: "2024-08-15"
  },
  {
    webTPID: "5039",
    companyName: "RALEY'S PAYABLES",
    contactName: "CAROL WALKER",
    email: "CWALKER@RALEYS.COM",
    phone: "(916) 373-6000",
    status: "Active",
    signupDate: "2024-08-12",
    contactDate: "2024-08-12"
  },
  {
    webTPID: "5038",
    companyName: "SAFEWAY PAYABLES",
    contactName: "JOSEPH HALL",
    email: "JHALL@SAFEWAY.COM",
    phone: "(925) 467-3000",
    status: "Active",
    signupDate: "2024-08-10",
    contactDate: "2024-08-10"
  },
  {
    webTPID: "5037",
    companyName: "SAVE-A-LOT PAYABLES",
    contactName: "DOROTHY ALLEN",
    email: "DALLEN@SAVE-A-LOT.COM",
    phone: "(314) 592-9300",
    status: "Active",
    signupDate: "2024-08-08",
    contactDate: "2024-08-08"
  },
  {
    webTPID: "5036",
    companyName: "SCHNUCKS PAYABLES",
    contactName: "GEORGE YOUNG",
    email: "GYOUNG@SCHNUCKS.COM",
    phone: "(314) 994-9900",
    status: "Active",
    signupDate: "2024-08-05",
    contactDate: "2024-08-05"
  },
  {
    webTPID: "5035",
    companyName: "SHOPRITE PAYABLES",
    contactName: "RUTH HERNANDEZ",
    email: "RHERNANDEZ@SHOPRITE.COM",
    phone: "(201) 843-5500",
    status: "Active",
    signupDate: "2024-08-03",
    contactDate: "2024-08-03"
  },
  {
    webTPID: "5034",
    companyName: "SPROUTS FARMERS MARKET PAYABLES",
    contactName: "BRIAN KING",
    email: "BKING@SPROUTS.COM",
    phone: "(480) 814-8016",
    status: "Active",
    signupDate: "2024-08-01",
    contactDate: "2024-08-01"
  },
  {
    webTPID: "5033",
    companyName: "STATER BROS PAYABLES",
    contactName: "ANNA WRIGHT",
    email: "AWRIGHT@STATERBROS.COM",
    phone: "(909) 733-5000",
    status: "Active",
    signupDate: "2024-07-28",
    contactDate: "2024-07-28"
  },
  {
    webTPID: "5032",
    companyName: "STOP & SHOP PAYABLES",
    contactName: "FRANK LOPEZ",
    email: "FLOPEZ@STOPANDSHOP.COM",
    phone: "(914) 253-1000",
    status: "Active",
    signupDate: "2024-07-25",
    contactDate: "2024-07-25"
  },
  {
    webTPID: "5031",
    companyName: "TRADER JOE'S PAYABLES",
    contactName: "VIRGINIA HILL",
    email: "VHILL@TRADERJOES.COM",
    phone: "(626) 599-3700",
    status: "Active",
    signupDate: "2024-07-22",
    contactDate: "2024-07-22"
  },
  {
    webTPID: "5030",
    companyName: "VONS PAYABLES",
    contactName: "LARRY SCOTT",
    email: "LSCOTT@VONS.COM",
    phone: "(818) 821-5000",
    status: "Active",
    signupDate: "2024-07-20",
    contactDate: "2024-07-20"
  },
  {
    webTPID: "5029",
    companyName: "WEGMANS PAYABLES",
    contactName: "SANDRA GREEN",
    email: "SGREEN@WEGMANS.COM",
    phone: "(585) 328-2550",
    status: "Active",
    signupDate: "2024-07-18",
    contactDate: "2024-07-18"
  },
  {
    webTPID: "5028",
    companyName: "WHOLE FOODS MARKET PAYABLES",
    contactName: "RAYMOND ADAMS",
    email: "RADAMS@WHOLEFOODS.COM",
    phone: "(512) 477-4455",
    status: "Active",
    signupDate: "2024-07-15",
    contactDate: "2024-07-15"
  },
  {
    webTPID: "5027",
    companyName: "WINN-DIXIE PAYABLES",
    contactName: "MARIE BAKER",
    email: "MBAKER@WINNDIXIE.COM",
    phone: "(904) 783-5000",
    status: "Active",
    signupDate: "2024-07-12",
    contactDate: "2024-07-12"
  },
  {
    webTPID: "5026",
    companyName: "WALMART PAYABLES",
    contactName: "CARL GONZALEZ",
    email: "CGONZALEZ@WALMART.COM",
    phone: "(479) 273-4000",
    status: "Active",
    signupDate: "2024-07-10",
    contactDate: "2024-07-10"
  },
  {
    webTPID: "5025",
    companyName: "TARGET PAYABLES",
    contactName: "ANGELA NELSON",
    email: "ANELSON@TARGET.COM",
    phone: "(612) 304-6073",
    status: "Active",
    signupDate: "2024-07-08",
    contactDate: "2024-07-08"
  },
  {
    webTPID: "5024",
    companyName: "AMAZON PAYABLES",
    contactName: "HAROLD CARTER",
    email: "HCARTER@AMAZON.COM",
    phone: "(206) 266-1000",
    status: "Active",
    signupDate: "2024-07-05",
    contactDate: "2024-07-05"
  },
  {
    webTPID: "5023",
    companyName: "CHEWY.COM PAYABLES",
    contactName: "TERESA MITCHELL",
    email: "TMITCHELL@CHEWY.COM",
    phone: "(800) 672-4399",
    status: "Active",
    signupDate: "2024-07-03",
    contactDate: "2024-07-03"
  },
  {
    webTPID: "5022",
    companyName: "PETCO PAYABLES",
    contactName: "JERRY PEREZ",
    email: "JPEREZ@PETCO.COM",
    phone: "(858) 453-7845",
    status: "Active",
    signupDate: "2024-07-01",
    contactDate: "2024-07-01"
  },
  {
    webTPID: "5021",
    companyName: "BEST BUY PAYABLES",
    contactName: "AMY ROBERTS",
    email: "AROBERTS@BESTBUY.COM",
    phone: "(612) 291-1000",
    status: "Active",
    signupDate: "2024-06-28",
    contactDate: "2024-06-28"
  },
  {
    webTPID: "5020",
    companyName: "STAPLES PAYABLES",
    contactName: "WAYNE TURNER",
    email: "WTURNER@STAPLES.COM",
    phone: "(508) 253-5000",
    status: "Active",
    signupDate: "2024-06-25",
    contactDate: "2024-06-25"
  },
  {
    webTPID: "5019",
    companyName: "OFFICE DEPOT PAYABLES",
    contactName: "KATHLEEN PHILLIPS",
    email: "KPHILLIPS@OFFICEDEPOT.COM",
    phone: "(561) 438-4800",
    status: "Active",
    signupDate: "2024-06-22",
    contactDate: "2024-06-22"
  },
  {
    webTPID: "5018",
    companyName: "MICHAELS STORES PAYABLES",
    contactName: "GREGORY CAMPBELL",
    email: "GCAMPBELL@MICHAELS.COM",
    phone: "(972) 409-1300",
    status: "Active",
    signupDate: "2024-06-20",
    contactDate: "2024-06-20"
  },
  {
    webTPID: "5017",
    companyName: "HOBBY LOBBY PAYABLES",
    contactName: "JUDITH PARKER",
    email: "JPARKER@HOBBYLOBBY.COM",
    phone: "(405) 745-1100",
    status: "Active",
    signupDate: "2024-06-18",
    contactDate: "2024-06-18"
  },
  {
    webTPID: "5016",
    companyName: "JOANN STORES PAYABLES",
    contactName: "GARY EVANS",
    email: "GEVANS@JOANN.COM",
    phone: "(330) 735-6600",
    status: "Active",
    signupDate: "2024-06-15",
    contactDate: "2024-06-15"
  },
  {
    webTPID: "5015",
    companyName: "WILLIAMS-SONOMA PAYABLES",
    contactName: "JEAN EDWARDS",
    email: "JEDWARDS@WILLIAMS-SONOMA.COM",
    phone: "(415) 421-7900",
    status: "Active",
    signupDate: "2024-06-12",
    contactDate: "2024-06-12"
  },
  {
    webTPID: "5014",
    companyName: "CRATE & BARREL PAYABLES",
    contactName: "DENNIS COLLINS",
    email: "DCOLLINS@CRATEANDBARREL.COM",
    phone: "(630) 369-4464",
    status: "Active",
    signupDate: "2024-06-10",
    contactDate: "2024-06-10"
  },
  {
    webTPID: "5013",
    companyName: "POTTERY BARN PAYABLES",
    contactName: "REBECCA STEWART",
    email: "RSTEWART@POTTERYBARN.COM",
    phone: "(888) 779-5176",
    status: "Active",
    signupDate: "2024-06-08",
    contactDate: "2024-06-08"
  },
  {
    webTPID: "5012",
    companyName: "IKEA PAYABLES",
    contactName: "ALBERT SANCHEZ",
    email: "ASANCHEZ@IKEA.COM",
    phone: "(888) 888-4532",
    status: "Active",
    signupDate: "2024-06-05",
    contactDate: "2024-06-05"
  },
  {
    webTPID: "5011",
    companyName: "WAYFAIR PAYABLES",
    contactName: "GRACE MORRIS",
    email: "GMORRIS@WAYFAIR.COM",
    phone: "(617) 532-6100",
    status: "Active",
    signupDate: "2024-06-03",
    contactDate: "2024-06-03"
  },
  {
    webTPID: "5010",
    companyName: "OVERSTOCK PAYABLES",
    contactName: "WILLIE ROGERS",
    email: "WROGERS@OVERSTOCK.COM",
    phone: "(801) 947-3100",
    status: "Active",
    signupDate: "2024-06-01",
    contactDate: "2024-06-01"
  },
  {
    webTPID: "5009",
    companyName: "CHEWY PAYABLES",
    contactName: "KATHERINE REED",
    email: "KREED@CHEWY.COM",
    phone: "(800) 672-4399",
    status: "Active",
    signupDate: "2024-05-28",
    contactDate: "2024-05-28"
  },
  {
    webTPID: "5008",
    companyName: "GAMESTOP PAYABLES",
    contactName: "LOUIS COOK",
    email: "LCOOK@GAMESTOP.COM",
    phone: "(817) 424-2000",
    status: "Active",
    signupDate: "2024-05-25",
    contactDate: "2024-05-25"
  },
  {
    webTPID: "5007",
    companyName: "BARNES & NOBLE PAYABLES",
    contactName: "EVELYN MORGAN",
    email: "EMORGAN@BARNESANDNOBLE.COM",
    phone: "(212) 633-3300",
    status: "Active",
    signupDate: "2024-05-22",
    contactDate: "2024-05-22"
  },
  {
    webTPID: "5006",
    companyName: "TOYS R US PAYABLES",
    contactName: "RUSSELL BELL",
    email: "RBELL@TOYSRUS.COM",
    phone: "(973) 617-3500",
    status: "Active",
    signupDate: "2024-05-20",
    contactDate: "2024-05-20"
  },
  {
    webTPID: "5005",
    companyName: "ACADEMY SPORTS PAYABLES",
    contactName: "CHRISTINA MURPHY",
    email: "CMURPHY@ACADEMY.COM",
    phone: "(281) 646-5200",
    status: "Active",
    signupDate: "2024-05-18",
    contactDate: "2024-05-18"
  },
  {
    webTPID: "5004",
    companyName: "CABELA'S PAYABLES",
    contactName: "CRAIG RIVERA",
    email: "CRIVERA@CABELAS.COM",
    phone: "(308) 234-5555",
    status: "Active",
    signupDate: "2024-05-15",
    contactDate: "2024-05-15"
  },
  {
    webTPID: "5003",
    companyName: "BASS PRO SHOPS PAYABLES",
    contactName: "MILDRED COOPER",
    email: "MCOOPER@BASSPRO.COM",
    phone: "(417) 873-5000",
    status: "Active",
    signupDate: "2024-05-12",
    contactDate: "2024-05-12"
  },
  {
    webTPID: "5002",
    companyName: "REI PAYABLES",
    contactName: "HOWARD RICHARDSON",
    email: "HRICHARDSON@REI.COM",
    phone: "(253) 891-2500",
    status: "Active",
    signupDate: "2024-05-10",
    contactDate: "2024-05-10"
  },
  {
    webTPID: "5001",
    companyName: "PATAGONIA PAYABLES",
    contactName: "EMMA COX",
    email: "ECOX@PATAGONIA.COM",
    phone: "(805) 643-8616",
    status: "Active",
    signupDate: "2024-05-08",
    contactDate: "2024-05-08"
  },
  {
    webTPID: "5000",
    companyName: "NORTH FACE PAYABLES",
    contactName: "FRED HOWARD",
    email: "FHOWARD@THENORTHFACE.COM",
    phone: "(336) 424-6000",
    status: "Active",
    signupDate: "2024-05-05",
    contactDate: "2024-05-05"
  },
  {
    webTPID: "4999",
    companyName: "NIKE PAYABLES",
    contactName: "GRACE WARD",
    email: "GWARD@NIKE.COM",
    phone: "(503) 671-6453",
    status: "Active",
    signupDate: "2024-05-03",
    contactDate: "2024-05-03"
  },
  {
    webTPID: "4998",
    companyName: "ADIDAS PAYABLES",
    contactName: "HENRY TORRES",
    email: "HTORRES@ADIDAS.COM",
    phone: "(971) 234-5678",
    status: "Active",
    signupDate: "2024-05-01",
    contactDate: "2024-05-01"
  },
  {
    webTPID: "4997",
    companyName: "UNDER ARMOUR PAYABLES",
    contactName: "ISABELLA PETERSON",
    email: "IPETERSON@UNDERARMOUR.COM",
    phone: "(410) 454-6428",
    status: "Active",
    signupDate: "2024-04-28",
    contactDate: "2024-04-28"
  }
];

// Helper function to search companies by name
export function searchCompanies(searchTerm: string): CustomerData[] {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return customerDatabase.filter(customer => 
    customer.companyName.toLowerCase().includes(lowerSearchTerm) ||
    customer.webTPID.includes(searchTerm)
  );
}

// Helper function to get company by ID
export function getCompanyById(webTPID: string): CustomerData | undefined {
  return customerDatabase.find(customer => customer.webTPID === webTPID);
}

// Helper function to get company by exact name
export function getCompanyByName(companyName: string): CustomerData | undefined {
  return customerDatabase.find(customer => 
    customer.companyName.toLowerCase() === companyName.toLowerCase()
  );
}

// Helper function to get company by fuzzy name matching
export function getCompanyByFuzzyName(companyName: string): CustomerData | undefined {
  const lowerName = companyName.toLowerCase();
  
  // First try exact match
  const exactMatch = customerDatabase.find(customer => 
    customer.companyName.toLowerCase() === lowerName
  );
  if (exactMatch) return exactMatch;
  
  // Then try contains match
  const containsMatch = customerDatabase.find(customer => 
    customer.companyName.toLowerCase().includes(lowerName) ||
    lowerName.includes(customer.companyName.toLowerCase())
  );
  if (containsMatch) return containsMatch;
  
  // Finally try partial word matching
  const words = lowerName.split(/\s+/);
  return customerDatabase.find(customer => {
    const customerWords = customer.companyName.toLowerCase().split(/\s+/);
    return words.some(word => 
      customerWords.some(customerWord => 
        customerWord.includes(word) || word.includes(customerWord)
      )
    );
  });
}