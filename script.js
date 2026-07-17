(function() {
  'use strict';

  // State Variables
  var activeStep = 0;
  var maxSteps = 4;
  var journeyRowId = 0;
  var hotelRowId = 0;
  var higherAccRowId = 0;
  var roadRailRowId = 0;

  // Dropdowns data choices
  var modeClassOpts = `
    <optgroup label="Air / वायु">
      <option value="Air Economy">Air Economy / वायुयान इकोनामी</option>
      <option value="Air Business">Air Business / वायुयान बिजनेस</option>
    </optgroup>
    <optgroup label="Rail / रेल">
      <option value="Rail AC First (1AC)">Rail First Class AC (1AC) / वातानुकूलित प्रथम श्रेणी</option>
      <option value="Rail AC 2 Tier (2AC)">Rail AC 2 Tier (2AC) / वातानुकूलित द्वितीय श्रेणी</option>
      <option value="Rail AC 3 Tier (3AC)">Rail AC 3 Tier (3AC) / वातानुकूलित तृतीय श्रेणी</option>
      <option value="Rail AC Chair Car (CC)">Rail AC Chair Car (CC) / वातानुकूलित चेयर कार</option>
      <option value="Rail Sleeper (SL)">Rail Sleeper (SL) / शयनयान श्रेणी</option>
      <option value="Rail Second Seating (2S)">Rail Second Seating (2S) / द्वितीय श्रेणी सीटिंग</option>
    </optgroup>
    <optgroup label="Road / सड़क">
      <option value="Bus Express">Bus Express / एक्सप्रेस बस</option>
      <option value="Bus Ordinary">Bus Ordinary / साधारण बस</option>
      <option value="Taxi Private">Taxi / टैक्सी</option>
      <option value="Auto Rickshaw">Auto Rickshaw / ऑटो रिक्शा</option>
      <option value="Personal Vehicle">Personal Vehicle / निजी वाहन</option>
    </optgroup>
    <optgroup label="Steamer / स्टीमर">
      <option value="Steamer Deluxe">Steamer Deluxe / स्टीमर डिलक्स</option>
      <option value="Steamer Cabin">Steamer Cabin / स्टीमर केबिन</option>
    </optgroup>
    <option value="Other">Other / अन्य</option>
  `;

  // Initialize the App
  window.onload = function() {
    // Setup draft on initial load
    var draft = localStorage.getItem('ta_bill_draft');
    if (draft) {
      try {
        fillFormFromData(JSON.parse(draft));
        showToast("Draft Loaded / ड्राफ्ट लोड किया गया");
      } catch(e) {
        console.error("Error loading draft", e);
        initDefaultRows();
      }
    } else {
      initDefaultRows();
    }
    
    // Auto register change calculators
    document.querySelectorAll('input, select, textarea').forEach(function(el) {
      el.addEventListener('input', runCalculations);
    });

    // Switch to first step visually
    switchStep(0);
  };

  function initDefaultRows() {
    addJourneyRow();
    addHotelRow();
    addHigherAccRow();
    addRoadRailRow();
  }

  // Tab switcher
  window.switchStep = function(stepIndex) {
    if (stepIndex < 0 || stepIndex >= maxSteps) return;
    activeStep = stepIndex;

    // Update Active Navigation Item
    var navItems = document.querySelectorAll('.nav-steps .nav-item');
    navItems.forEach(function(item, idx) {
      if (idx === stepIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Visible Card
    for (var i = 0; i < maxSteps; i++) {
      var card = document.getElementById('step' + i);
      if (i === stepIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    }

    // Scroll content view to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dark/Light Theme toggler
  window.toggleTheme = function() {
    var html = document.documentElement;
    var current = html.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    
    var chk = document.getElementById('themeCheckbox');
    if (chk) chk.checked = next === 'dark';
    
    var toggleLabel = document.querySelector('.theme-toggle span');
    if (toggleLabel) toggleLabel.textContent = next === 'dark' ? '☀️ Light Mode / लाइट मोड' : '🌙 Dark Mode / डार्क मोड';
  };

  // Row Management: Journey Table
  window.addJourneyRow = function() {
    var tbody = document.getElementById('journeyBody');
    var rId = journeyRowId++;
    
    var row = document.createElement('tr');
    row.setAttribute('data-row-id', rId);
    row.innerHTML = `
      <td class="col-sno">${tbody.children.length + 1}</td>
      <td>
        <input type="date" class="j-dep-date" onchange="runCalculations()">
        <input type="time" class="j-dep-time" style="margin-top: 4px;">
      </td>
      <td><input type="text" class="j-dep-from" placeholder="Station"></td>
      <td>
        <input type="date" class="j-arr-date" onchange="runCalculations()">
        <input type="time" class="j-arr-time" style="margin-top: 4px;">
      </td>
      <td><input type="text" class="j-arr-to" placeholder="Station"></td>
      <td>
        <select class="j-mode-class">
          ${modeClassOpts}
        </select>
      </td>
      <td><input type="number" class="j-fare" style="text-align: right;" placeholder="0.00" min="0" step="0.01" oninput="runCalculations()"></td>
      <td><input type="number" class="j-distance" style="text-align: right;" placeholder="Kms" min="0" step="0.1" oninput="runCalculations()"></td>
      <td><input type="number" class="j-halt" style="text-align: right;" placeholder="Days" min="0" step="0.5" oninput="runCalculations()"></td>
      <td><input type="text" class="j-purpose" placeholder="Purpose"></td>
      <td class="col-action no-print">
        <button class="btn btn-small btn-danger" onclick="removeJourneyRow(${rId})">X</button>
      </td>
    `;
    tbody.appendChild(row);
    renumberTable('journeyTable');
    runCalculations();
  };

  window.removeJourneyRow = function(id) {
    var tbody = document.getElementById('journeyBody');
    var row = tbody.querySelector(`tr[data-row-id="${id}"]`);
    if (row) {
      row.parentNode.removeChild(row);
    }
    renumberTable('journeyTable');
    runCalculations();
  };

  // Row Management: Hotel Table
  window.addHotelRow = function() {
    var tbody = document.getElementById('hotelBody');
    var rId = hotelRowId++;

    var row = document.createElement('tr');
    row.setAttribute('data-row-id', rId);
    row.innerHTML = `
      <td><input type="date" class="h-from"></td>
      <td><input type="date" class="h-to"></td>
      <td><input type="text" class="h-name" placeholder="Hotel name"></td>
      <td><input type="number" class="h-rate" style="text-align: right;" placeholder="Rate/day" min="0" step="0.01" oninput="calculateHotelTotals()"></td>
      <td><input type="number" class="h-total" style="text-align: right;" placeholder="Total Paid" min="0" step="0.01" oninput="runCalculations()"></td>
      <td class="col-action no-print">
        <button class="btn btn-small btn-danger" onclick="removeHotelRow(${rId})">X</button>
      </td>
    `;
    tbody.appendChild(row);
    runCalculations();
  };

  window.removeHotelRow = function(id) {
    var tbody = document.getElementById('hotelBody');
    var row = tbody.querySelector(`tr[data-row-id="${id}"]`);
    if (row) {
      row.parentNode.removeChild(row);
    }
    runCalculations();
  };

  window.calculateHotelTotals = function() {
    var tbody = document.getElementById('hotelBody');
    tbody.querySelectorAll('tr').forEach(function(row) {
      var fromVal = row.querySelector('.h-from').value;
      var toVal = row.querySelector('.h-to').value;
      var rateVal = parseFloat(row.querySelector('.h-rate').value || 0);
      var totalField = row.querySelector('.h-total');

      if (fromVal && toVal && rateVal > 0) {
        var date1 = new Date(fromVal);
        var date2 = new Date(toVal);
        var diffTime = Math.abs(date2 - date1);
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // default to 1 day
        totalField.value = (diffDays * rateVal).toFixed(2);
      }
    });
    runCalculations();
  };

  // Row Management: Higher Accommodation
  window.addHigherAccRow = function() {
    var tbody = document.getElementById('higherAccBody');
    var rId = higherAccRowId++;

    var row = document.createElement('tr');
    row.setAttribute('data-row-id', rId);
    row.innerHTML = `
      <td><input type="date" class="ha-date"></td>
      <td><input type="text" class="ha-from" placeholder="From"></td>
      <td><input type="text" class="ha-to" placeholder="To"></td>
      <td><input type="text" class="ha-conveyance" placeholder="Mode"></td>
      <td><input type="text" class="ha-entitled" placeholder="Entitled Class"></td>
      <td><input type="text" class="ha-travelled" placeholder="Class Travelled"></td>
      <td><input type="number" class="ha-fare" style="text-align: right;" placeholder="Fare Paid" min="0" step="0.01" oninput="runCalculations()"></td>
      <td class="col-action no-print">
        <button class="btn btn-small btn-danger" onclick="removeHigherAccRow(${rId})">X</button>
      </td>
    `;
    tbody.appendChild(row);
    runCalculations();
  };

  window.removeHigherAccRow = function(id) {
    var tbody = document.getElementById('higherAccBody');
    var row = tbody.querySelector(`tr[data-row-id="${id}"]`);
    if (row) {
      row.parentNode.removeChild(row);
    }
    runCalculations();
  };

  // Row Management: Road Journey between places connected by Rail
  window.addRoadRailRow = function() {
    var tbody = document.getElementById('roadRailBody');
    var rId = roadRailRowId++;

    var row = document.createElement('tr');
    row.setAttribute('data-row-id', rId);
    row.innerHTML = `
      <td><input type="date" class="rr-date"></td>
      <td><input type="text" class="rr-from" placeholder="From"></td>
      <td><input type="text" class="rr-to" placeholder="To"></td>
      <td><input type="number" class="rr-fare" style="text-align: right;" placeholder="Fare Paid" min="0" step="0.01" oninput="runCalculations()"></td>
      <td class="col-action no-print">
        <button class="btn btn-small btn-danger" onclick="removeRoadRailRow(${rId})">X</button>
      </td>
    `;
    tbody.appendChild(row);
    runCalculations();
  };

  window.removeRoadRailRow = function(id) {
    var tbody = document.getElementById('roadRailBody');
    var row = tbody.querySelector(`tr[data-row-id="${id}"]`);
    if (row) {
      row.parentNode.removeChild(row);
    }
    runCalculations();
  };

  function renumberTable(tableId) {
    var tbody = document.querySelector(`#${tableId} tbody`);
    var index = 1;
    tbody.querySelectorAll('tr').forEach(function(row) {
      var cell = row.querySelector('.col-sno');
      if (cell) {
        cell.textContent = index++;
      }
    });
  }

  // Sync T.A. Advance values between page 3 and page 4
  window.syncAdvance = function() {
    var val = document.getElementById('empAdvanceDrawn').value;
    document.getElementById('partBAdvanceTotal').value = val;
    runCalculations();
  };

  // Auto Calculations Core Engine
  window.runCalculations = function() {
    var autoCalcChecked = document.getElementById('autoCalculate').checked;

    // Part B references
    var fareField = document.getElementById('partBFare');
    var roadKmsField = document.getElementById('partBRoadKms');
    var roadRateField = document.getElementById('partBRoadRate');
    var roadTotalField = document.getElementById('partBRoadTotal');

    var daDays1Field = document.getElementById('partBDays1');
    var daRate1Field = document.getElementById('partBRate1');
    var daAmt1Field = document.getElementById('partDAAmount1');

    var daDays2Field = document.getElementById('partBDays2');
    var daRate2Field = document.getElementById('partBRate2');
    var daAmt2Field = document.getElementById('partDAAmount2');

    var daDays3Field = document.getElementById('partBDays3');
    var daRate3Field = document.getElementById('partBRate3');
    var daAmt3Field = document.getElementById('partDAAmount3');

    var actualExpField = document.getElementById('partBActualExpenses');
    var grossAmtField = document.getElementById('partBGrossTotal');
    
    var advVoucherField = document.getElementById('partBAdvanceVoucher');
    var advDateField = document.getElementById('partBAdvanceDate');
    var advAmtField = document.getElementById('partBAdvanceTotal');
    
    var netAmtField = document.getElementById('partBNetTotal');

    // 1. Fetch data from Part A if Autocalculate is enabled
    if (autoCalcChecked) {
      // Collect fares from journey table
      var faresSum = 0;
      var roadKmsSum = 0;
      var haltDaysSum = 0;

      document.querySelectorAll('#journeyBody tr').forEach(function(row) {
        faresSum += parseFloat(row.querySelector('.j-fare').value || 0);
        roadKmsSum += parseFloat(row.querySelector('.j-distance').value || 0);
        haltDaysSum += parseFloat(row.querySelector('.j-halt').value || 0);
      });

      // Add fares of road rail table as well (if any)
      document.querySelectorAll('#roadRailBody tr').forEach(function(row) {
        faresSum += parseFloat(row.querySelector('.rr-fare').value || 0);
      });

      // Populate Part B fields and set as read-only where appropriate
      fareField.value = faresSum > 0 ? faresSum.toFixed(2) : "";
      fareField.setAttribute('readonly', 'true');

      roadKmsField.value = roadKmsSum > 0 ? roadKmsSum.toFixed(2) : "";
      roadKmsField.setAttribute('readonly', 'true');

      // Note: user still inputs road rate manually since it varies by region
      
      // Sum halt days in daily allowance row 1 by default
      daDays1Field.value = haltDaysSum > 0 ? haltDaysSum : "";
      daDays1Field.setAttribute('readonly', 'true');

      // Sync advance
      var advAmt = parseFloat(document.getElementById('empAdvanceDrawn').value || 0);
      advAmtField.value = advAmt > 0 ? advAmt.toFixed(2) : "";
      advAmtField.setAttribute('readonly', 'true');
    } else {
      // Remove read-only block
      fareField.removeAttribute('readonly');
      roadKmsField.removeAttribute('readonly');
      daDays1Field.removeAttribute('readonly');
      advAmtField.removeAttribute('readonly');
    }

    // 2. Perform multiplications
    // Road mileage total
    var rKms = parseFloat(roadKmsField.value || 0);
    var rRate = parseFloat(roadRateField.value || 0);
    var rTotal = rKms * rRate;
    roadTotalField.value = rTotal > 0 ? rTotal.toFixed(2) : "";

    // Daily Allowance Totals
    var da1Total = parseFloat(daDays1Field.value || 0) * parseFloat(daRate1Field.value || 0);
    daAmt1Field.value = da1Total > 0 ? da1Total.toFixed(2) : "";

    var da2Total = parseFloat(daDays2Field.value || 0) * parseFloat(daRate2Field.value || 0);
    daAmt2Field.value = da2Total > 0 ? da2Total.toFixed(2) : "";

    var da3Total = parseFloat(daDays3Field.value || 0) * parseFloat(daRate3Field.value || 0);
    daAmt3Field.value = da3Total > 0 ? da3Total.toFixed(2) : "";

    // 3. Gross Sum Calculation
    var fareTotalVal = parseFloat(fareField.value || 0);
    var roadTotalVal = parseFloat(roadTotalField.value || 0);
    var da1TotalVal = parseFloat(daAmt1Field.value || 0);
    var da2TotalVal = parseFloat(daAmt2Field.value || 0);
    var da3TotalVal = parseFloat(daAmt3Field.value || 0);
    var actualExpVal = parseFloat(actualExpField.value || 0);

    var grossSum = fareTotalVal + roadTotalVal + da1TotalVal + da2TotalVal + da3TotalVal + actualExpVal;
    grossAmtField.value = grossSum > 0 ? grossSum.toFixed(2) : "";

    // 4. Net Sum Calculation
    var advanceDrawnVal = parseFloat(advAmtField.value || 0);
    var netSum = grossSum - advanceDrawnVal;
    netAmtField.value = netSum > 0 ? netSum.toFixed(2) : "";

    // 5. Update Words Translation
    var wordsDisplay = document.getElementById('wordsDisplay');
    if (wordsDisplay) {
      if (netSum > 0) {
        wordsDisplay.textContent = numberToWords(netSum) + " Rupees Only";
      } else {
        wordsDisplay.textContent = "Zero Rupees Only";
      }
    }
  };

  // Local Storage Save Draft
  window.saveDraft = function() {
    var data = collectFormData();
    localStorage.setItem('ta_bill_draft', JSON.stringify(data));
    showToast("Draft Saved / ड्राफ्ट सुरक्षित किया गया।");
  };

  // Local Storage Load Draft
  window.loadDraft = function() {
    var draft = localStorage.getItem('ta_bill_draft');
    if (!draft) {
      showToast("No draft found / कोई ड्राफ्ट नहीं मिला।");
      return;
    }
    try {
      fillFormFromData(JSON.parse(draft));
      showToast("Draft Loaded / ड्राफ्ट लोड किया गया।");
      runCalculations();
    } catch(e) {
      console.error(e);
      showToast("Failed to load / लोड करने में विफल।");
    }
  };

  // Form Clean Reset
  window.clearForm = function() {
    if (!confirm("Are you sure you want to clear the entire form? / क्या आप पूरा फ़ॉर्म साफ़ करना चाहते हैं?")) {
      return;
    }
    
    // Reset inputs
    document.querySelectorAll('input:not([type="checkbox"]), textarea, select').forEach(function(el) {
      el.value = "";
    });

    // Clear dynamic tables
    document.getElementById('journeyBody').innerHTML = "";
    document.getElementById('hotelBody').innerHTML = "";
    document.getElementById('higherAccBody').innerHTML = "";
    document.getElementById('roadRailBody').innerHTML = "";

    // Set default rows
    journeyRowId = 0;
    hotelRowId = 0;
    higherAccRowId = 0;
    roadRailRowId = 0;
    initDefaultRows();

    // Reset auto calc state
    document.getElementById('autoCalculate').checked = true;

    // Update math
    runCalculations();
    showToast("Form Cleared / फ़ॉर्म साफ़ किया गया।");
  };

  // Toast Alert Helper
  function showToast(msg) {
    var toast = document.getElementById('toastMessage');
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(function() {
        toast.classList.remove('show');
      }, 3000);
    }
  }

  // Form Data Collection Builder
  function collectFormData() {
    var data = {
      meta: {
        subBillNo: document.getElementById('subBillNo').value,
        autoCalculate: document.getElementById('autoCalculate').checked
      },
      personal: {
        empName: document.getElementById('empName').value,
        empDesignation: document.getElementById('empDesignation').value,
        empPay: document.getElementById('empPay').value,
        empHQ: document.getElementById('empHQ').value
      },
      airConveyance: {
        airExchangeVoucher: document.getElementById('airExchangeVoucher').value,
        airArrangedBy: document.getElementById('airArrangedBy').value
      },
      railConveyance: {
        railTrainType: document.getElementById('railTrainType').value,
        railReturnTicketAvail: document.getElementById('railReturnTicketAvail').value,
        railReturnTicketReason: document.getElementById('railReturnTicketReason').value
      },
      roadConveyance: document.getElementById('roadConveyanceDetails').value,
      absences: {
        absenceCL: document.getElementById('absenceCL').value,
        absenceHolidays: document.getElementById('absenceHolidays').value
      },
      freeMeals: {
        freeBoardDates: document.getElementById('freeBoardDates').value,
        freeLodgingDates: document.getElementById('freeLodgingDates').value,
        freeBoardLodgingDates: document.getElementById('freeBoardLodgingDates').value
      },
      sanctionDetails: document.getElementById('higherClassSanction').value,
      empAdvanceDrawn: document.getElementById('empAdvanceDrawn').value,
      signatures: {
        certDate: document.getElementById('certDate').value,
        certSign: document.getElementById('certSign').value,
        clerkSign: document.getElementById('clerkSign').value,
        ddoSign: document.getElementById('ddoSign').value,
        controllingSign: document.getElementById('controllingSign').value,
        countersign: document.getElementById('countersign').value
      },
      officeBills: {
        partBFare: document.getElementById('partBFare').value,
        partBRoadKms: document.getElementById('partBRoadKms').value,
        partBRoadRate: document.getElementById('partBRoadRate').value,
        partBDays1: document.getElementById('partBDays1').value,
        partBRate1: document.getElementById('partBRate1').value,
        partBDays2: document.getElementById('partBDays2').value,
        partBRate2: document.getElementById('partBRate2').value,
        partBDays3: document.getElementById('partBDays3').value,
        partBRate3: document.getElementById('partBRate3').value,
        partBActualExpenses: document.getElementById('partBActualExpenses').value,
        partBAdvanceVoucher: document.getElementById('partBAdvanceVoucher').value,
        partBAdvanceDate: document.getElementById('partBAdvanceDate').value,
        partBAdvanceTotal: document.getElementById('partBAdvanceTotal').value,
        debitableHead: document.getElementById('debitableHead').value
      },
      // Tables
      journeyRows: getTableData('journeyBody', [
        'j-dep-date', 'j-dep-time', 'j-dep-from', 'j-arr-date', 
        'j-arr-time', 'j-arr-to', 'j-mode-class', 'j-fare', 'j-distance', 'j-halt', 'j-purpose'
      ]),
      hotelRows: getTableData('hotelBody', [
        'h-from', 'h-to', 'h-name', 'h-rate', 'h-total'
      ]),
      higherAccRows: getTableData('higherAccBody', [
        'ha-date', 'ha-from', 'ha-to', 'ha-conveyance', 'ha-entitled', 'ha-travelled', 'ha-fare'
      ]),
      roadRailRows: getTableData('roadRailBody', [
        'rr-date', 'rr-from', 'rr-to', 'rr-fare'
      ])
    };
    return data;
  }

  // Collect Row arrays helper
  function getTableData(bodyId, classList) {
    var list = [];
    var rows = document.querySelectorAll(`#${bodyId} tr`);
    rows.forEach(function(row) {
      var obj = {};
      classList.forEach(function(cls) {
        var input = row.querySelector('.' + cls);
        if (input) {
          obj[cls] = input.value;
        }
      });
      list.push(obj);
    });
    return list;
  }

  // Populate UI from draft data
  function fillFormFromData(d) {
    if (!d) return;

    // Meta & calc
    document.getElementById('subBillNo').value = d.meta.subBillNo || "";
    document.getElementById('autoCalculate').checked = d.meta.autoCalculate !== false;

    // Personal Details
    document.getElementById('empName').value = d.personal.empName || "";
    document.getElementById('empDesignation').value = d.personal.empDesignation || "";
    document.getElementById('empPay').value = d.personal.empPay || "";
    document.getElementById('empHQ').value = d.personal.empHQ || "";

    // Conveyance Qs
    document.getElementById('airExchangeVoucher').value = d.airConveyance.airExchangeVoucher || "No";
    document.getElementById('airArrangedBy').value = d.airConveyance.airArrangedBy || "";
    document.getElementById('railTrainType').value = d.railConveyance.railTrainType || "Mail/Express";
    document.getElementById('railReturnTicketAvail').value = d.railConveyance.railReturnTicketAvail || "No";
    document.getElementById('railReturnTicketReason').value = d.railConveyance.railReturnTicketReason || "";
    document.getElementById('roadConveyanceDetails').value = d.roadConveyance || "";

    // Holidays
    document.getElementById('absenceCL').value = d.absences.absenceCL || "";
    document.getElementById('absenceHolidays').value = d.absences.absenceHolidays || "";

    // Free meals
    document.getElementById('freeBoardDates').value = d.freeMeals.freeBoardDates || "";
    document.getElementById('freeLodgingDates').value = d.freeMeals.freeLodgingDates || "";
    document.getElementById('freeBoardLodgingDates').value = d.freeMeals.freeBoardLodgingDates || "";

    // Sanctions
    document.getElementById('higherClassSanction').value = d.sanctionDetails || "";
    document.getElementById('empAdvanceDrawn').value = d.empAdvanceDrawn || "";

    // Signatures
    document.getElementById('certDate').value = d.signatures.certDate || "";
    document.getElementById('certSign').value = d.signatures.certSign || "";
    document.getElementById('clerkSign').value = d.signatures.clerkSign || "";
    document.getElementById('ddoSign').value = d.signatures.ddoSign || "";
    document.getElementById('controllingSign').value = d.signatures.controllingSign || "";
    document.getElementById('countersign').value = d.signatures.countersign || "";

    // Part B Bill Details
    document.getElementById('partBFare').value = d.officeBills.partBFare || "";
    document.getElementById('partBRoadKms').value = d.officeBills.partBRoadKms || "";
    document.getElementById('partBRoadRate').value = d.officeBills.partBRoadRate || "";
    document.getElementById('partBDays1').value = d.officeBills.partBDays1 || "";
    document.getElementById('partBRate1').value = d.officeBills.partBRate1 || "";
    document.getElementById('partBDays2').value = d.officeBills.partBDays2 || "";
    document.getElementById('partBRate2').value = d.officeBills.partBRate2 || "";
    document.getElementById('partBDays3').value = d.officeBills.partBDays3 || "";
    document.getElementById('partBRate3').value = d.officeBills.partBRate3 || "";
    document.getElementById('partBActualExpenses').value = d.officeBills.partBActualExpenses || "";
    document.getElementById('partBAdvanceVoucher').value = d.officeBills.partBAdvanceVoucher || "";
    document.getElementById('partBAdvanceDate').value = d.officeBills.partBAdvanceDate || "";
    document.getElementById('partBAdvanceTotal').value = d.officeBills.partBAdvanceTotal || "";
    document.getElementById('debitableHead').value = d.officeBills.debitableHead || "";

    // Restore Tables
    restoreTable('journeyBody', d.journeyRows, addJourneyRow, [
      'j-dep-date', 'j-dep-time', 'j-dep-from', 'j-arr-date', 
      'j-arr-time', 'j-arr-to', 'j-mode-class', 'j-fare', 'j-distance', 'j-halt', 'j-purpose'
    ]);
    restoreTable('hotelBody', d.hotelRows, addHotelRow, [
      'h-from', 'h-to', 'h-name', 'h-rate', 'h-total'
    ]);
    restoreTable('higherAccBody', d.higherAccRows, addHigherAccRow, [
      'ha-date', 'ha-from', 'ha-to', 'ha-conveyance', 'ha-entitled', 'ha-travelled', 'ha-fare'
    ]);
    restoreTable('roadRailBody', d.roadRailRows, addRoadRailRow, [
      'rr-date', 'rr-from', 'rr-to', 'rr-fare'
    ]);
  }

  // Restore table rows helper
  function restoreTable(bodyId, rowsData, addRowFunc, classList) {
    var tbody = document.getElementById(bodyId);
    tbody.innerHTML = ""; // Clear
    if (!rowsData || rowsData.length === 0) {
      addRowFunc();
      return;
    }
    rowsData.forEach(function(rowObj) {
      addRowFunc();
      var lastRow = tbody.lastElementChild;
      classList.forEach(function(cls) {
        var input = lastRow.querySelector('.' + cls);
        if (input && rowObj[cls] !== undefined) {
          input.value = rowObj[cls];
        }
      });
    });
    if (bodyId === 'journeyBody') renumberTable('journeyTable');
  }

  // Number to words converter (Indian Numbering Scheme)
  function numberToWords(num) {
    if (num === 0) return 'Zero';
    
    var ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    var tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    function helper(n) {
      var str = '';
      if (n >= 10000000) {
        str += helper(Math.floor(n / 10000000)) + ' Crore ';
        n %= 10000000;
      }
      if (n >= 100000) {
        str += helper(Math.floor(n / 100000)) + ' Lakh ';
        n %= 100000;
      }
      if (n >= 1000) {
        str += helper(Math.floor(n / 1000)) + ' Thousand ';
        n %= 1000;
      }
      if (n >= 100) {
        str += helper(Math.floor(n / 100)) + ' Hundred ';
        n %= 100;
      }
      if (n > 0) {
        if (str !== '') str += 'and ';
        if (n < 20) {
          str += ones[n] + ' ';
        } else {
          str += tens[Math.floor(n / 10)] + ' ';
          if (n % 10 !== 0) {
            str += ones[n % 10] + ' ';
          }
        }
      }
      return str;
    }

    var integerPart = Math.floor(num);
    var decimalPart = Math.round((num - integerPart) * 100);
    var result = helper(integerPart).trim();
    
    if (decimalPart > 0) {
      result += " and " + helper(decimalPart).trim() + " Paise";
    }
    
    return result;
  }

})();
