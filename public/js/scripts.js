document.addEventListener("DOMContentLoaded", () => {
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");

  // ************ NEW TABLE FILTERS AND SEARCH ************
  document.getElementById("searchFilters").addEventListener("click", () => {
    const form = document.getElementById("filterForm");
    const params = new URLSearchParams(new FormData(form));
    window.location.href = `/projects?${params.toString()}`;
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    document.getElementById("filterForm").reset();
    window.location.href = "/projects";
  });
  // ************ END OF NEW TABLE FILTERS AND SEARCH ************

  // ************* NEW BAR CHART WITH A BAR CHART ROUTE *************
  async function loadBarChart(filters = {}) {
    const params = new URLSearchParams(filters);

    try {
      const res = await fetch(`/projects/bar-data?${params.toString()}`);

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          alert("Session expired. Redirecting to login...");
          window.location.href = "/login";
          return;
        } else {
          throw new Error(`Server returned ${res.status}`);
        }
      }

      const data = await res.json();
      const labels = data.map((d) => d.label); // now project IDs
      const descriptions = data.map((d) => d.description);
      const values = data.map((d) => d.value);
      const boroughs = data.map((d) => d.borough);
      const fiscalYears = data.map((d) => d.fiscal_year);

      const ctx = document.getElementById("barChartCanvas").getContext("2d");
      if (window.barChartInstance) window.barChartInstance.destroy();

      window.barChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Top 10 Projects by Amount",
              data: values,
              backgroundColor: "rgba(0, 123, 255, 0.6)",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  const index = tooltipItems[0].dataIndex;
                  return `ID: ${labels[index]}\ndescription: ${descriptions[index]}\nborough: ${boroughs[index]}\nfiscalYear: ${fiscalYears[index]}`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                maxRotation: 0,
                minRotation: 0,
              },
            },
            y: {
              grid: {
                display: false,
              },
              beginAtZero: true,
              ticks: {
                callback: (value) => "$" + value.toLocaleString(),
              },
            },
          },
        },
      });

      document.getElementById("noBarDataMessage").style.display = data.length
        ? "none"
        : "block";
    } catch (error) {
      console.error("Error loading bar chart:", error);
      alert("Could not load chart data. Please try again.");
    }
  }

  // ************* END OF NEW BAR CHART WITH A BAR CHART ROUTE *************

  // console.log("button clicked");
  tabLinks.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const target = btn.dataset.tab;

      tabLinks.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((t) => (t.style.display = "none"));

      btn.classList.add("active");
      const tab = document.getElementById(target);
      tab.style.display = "block";

      if (target === "barTab") {
        createBarChart();
      }

      if (target === "pieTab") {
        const selectedAward = document.getElementById("awardRangeSelect").value;
        getDataByAmountRange(selectedAward);
      }
    });
  });

  //EXTRACT PROJECT DATA FROM TABLE
  function extractProjectDataFromTable() {
    const rows = document.querySelectorAll("#budgetTable tbody tr");
    const projects = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      projects.push({
        description: cells[0]?.textContent.trim() || "",
        id: cells[1]?.textContent.trim() || "",
        borough: cells[2]?.textContent.trim() || "",
        amount: parseFloat(cells[3]?.textContent.replace(/[$,]/g, "")) || 0,
        sponsor: cells[4]?.textContent.trim() || "",
        reportedYear: cells[5]?.textContent.trim() || "",
        fiscalYear: cells[6]?.textContent.trim() || "",
        councilDistrict: cells[7]?.textContent.trim() || "",
      });
    });

    return projects;
  }

  const budgetData = extractProjectDataFromTable();
  let globalPieData = [];
  let pieChartInstance;

  function groupBudgetByKey(data, key) {
    const grouped = {};

    data.forEach((project) => {
      const groupValue = project[key] || "Unknown";
      if (!grouped[groupValue]) {
        grouped[groupValue] = 0;
      }
      grouped[groupValue] += project.award;
    });

    return grouped;
  }

  //BAR CHART
  function createBarChart() {
    const startYear = parseInt(document.getElementById("yearRangeStart").value);
    const endYear = parseInt(document.getElementById("yearRangeEnd").value);
    loadBarChart(); // Load top 10 on page load
    // ADDING THE BAR CHART FILTERS AND SEARCH
    document.getElementById("applyBarFilters").addEventListener("click", () => {
      const startYear_filter = parseInt(
        document.getElementById("yearRangeStart").value
      );
      const endYear_filter = parseInt(
        document.getElementById("yearRangeEnd").value
      );
      const errorSpan = document.getElementById("yearError");
      const borough = document.getElementById("filterBorough").value;
      const district = document.getElementById("filterDistrict").value;

      if (
        endYear_filter &&
        startYear_filter &&
        endYear_filter < startYear_filter
      ) {
        errorSpan.style.display = "block";
        return; // Stop search
      } else {
        errorSpan.style.display = "none";
      }

      loadBarChart({ startYear_filter, endYear_filter, borough, district });
    });

    // Reset filters and reload full chart
    document.getElementById("resetBarFilters").addEventListener("click", () => {
      document.getElementById("yearRangeStart").value = startYear;
      document.getElementById("yearRangeEnd").value = endYear;
      document.getElementById(
        "yearRangeDisplay"
      ).innerText = `FY${startYear} - FY${endYear}`;
      document.getElementById("filterBorough").value = "";
      document.getElementById("filterDistrict").value = "";
      loadBarChart(); // reload full chart
    });
  }

  //******** YEAR RANGE FILTER ******************/
  function updateYearRangeLabel() {
    const start = document.getElementById("yearRangeStart").value;
    const end = document.getElementById("yearRangeEnd").value;
    document.getElementById(
      "yearRangeDisplay"
    ).textContent = `FY${start} - FY${end}`;
  }

  document
    .getElementById("yearRangeStart")
    .addEventListener("input", updateYearRangeLabel);
  document
    .getElementById("yearRangeEnd")
    .addEventListener("input", updateYearRangeLabel);
  //****************** END YEAR RANGE FILTER *********************/

  document
    .getElementById("groupByDropdown")
    .addEventListener("change", () => createPieChart(globalPieData));

  const getDataByAmountRange = async function (selectedRange) {
    try {
      const res = await fetch(`/projects/byAwardRange?range=${selectedRange}`);
      const data = await res.json();

      globalPieData = data;
      createPieChart(data);
    } catch (err) {
      console.error("Error fetching award data:", err);
    }
  };
  document
    .getElementById("awardRangeSelect")
    .addEventListener("change", async function () {
      const selectedRange = this.value;
      await getDataByAmountRange(selectedRange);
    });

  //PIE CHART
  function createPieChart(pieData) {
    const filtered = filterPieChartData(pieData);

    const selectedKey = document.getElementById("groupByDropdown").value;
    const grouped = groupBudgetByKey(filtered, selectedKey);

    const labels = Object.keys(grouped);
    const values = Object.values(grouped);

    const ctx = document.getElementById("pieChartCanvas").getContext("2d");
    const message = document.getElementById("noPieDataMessage");

    if (pieChartInstance) {
      pieChartInstance.destroy();
    }

    if (values.length === 0) {
      message.style.display = "block";
      return;
    } else {
      message.style.display = "none";
    }

    pieChartInstance = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Capital Budget Distribution",
            data: values,
            backgroundColor: [
              "#4e79a7",
              "#f28e2c",
              "#e15759",
              "#76b7b2",
              "#59a14f",
              "#edc949",
              "#af7aa1",
              "#ff9da7",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.chart._metasets[0].total;
                const value = context.parsed;
                const percentage = ((value / total) * 100).toFixed(2) + "%";
                return `${context.label}: ${value} (${percentage})`;
              },
            },
          },
        },
      },
    });
  }

  //Table Filters and Search
  function filterTableData(data) {
    const selectedBorough = document
      .getElementById("searchBorough")
      .value.trim();
    const selectedYear = document.getElementById("searchFy").value.trim();
    const selectedDistrict = document
      .getElementById("searchDistrict")
      .value.trim();
    const sponsorInput = document
      .getElementById("searchSponsor")
      .value.trim()
      .toLowerCase();

    return data.filter((project) => {
      return (
        (!selectedBorough || project.borough === selectedBorough) &&
        (!selectedYear || project.fiscalYear === selectedYear) &&
        (!selectedDistrict || project.councilDistrict === selectedDistrict) &&
        (!sponsorInput || project.sponsor.toLowerCase().includes(sponsorInput))
      );
    });
  }

  function updateProjectTable(data) {
    const tbody = document.querySelector("#budgetTable tbody");
    tbody.innerHTML = "";

    data.forEach((project) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${project.description}</td>
        <td>${project.id}</td>
        <td>${project.borough}</td>
        <td>$${project.amount.toLocaleString()}</td>
        <td>${project.sponsor}</td>
        <td>${project.reportedYear}</td>
        <td>${project.fiscalYear}</td>
        <td>${project.councilDistrict}</td>
      `;
      tbody.appendChild(row);
    });
  }

  document.getElementById("searchFilters").addEventListener("click", () => {
    const filtered = filterTableData(budgetData);
    updateProjectTable(filtered);
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    document.getElementById("searchBorough").value = "";
    document.getElementById("searchFy").value = "";
    document.getElementById("searchDistrict").value = "";
    document.getElementById("searchSponsor").value = "";
    updateProjectTable(budgetData);
  });

  //PIE CHART FILTERS AND SEARCH
  function filterPieChartData(data) {
    const borough = document.getElementById("pieSearchBorough").value.trim();
    const year = document.getElementById("pieSearchFy").value.trim();
    const district = document.getElementById("pieSearchDistrict").value.trim();
    const sponsor = document
      .getElementById("pieSearchSponsor")
      .value.trim()
      .toLowerCase();
    const neighborhood = document
      .getElementById("pieSearchNieghborhood")
      .value.trim();

    return data.filter((project) => {
      return (
        (!borough || project.borough_full === borough) &&
        (!year || project.fiscal_year === year) &&
        (!district || project.council_district === parseInt(district)) &&
        (!sponsor || (project.sponsor || "").toLowerCase().includes(sponsor)) &&
        (!neighborhood || project.neighborhoods.includes(neighborhood))
      );
    });
  }

  document.getElementById("pieSearchFilters").addEventListener("click", () => {
    createPieChart(globalPieData);
  });

  document.getElementById("pieResetFilters").addEventListener("click", () => {
    document.getElementById("pieSearchBorough").value = "";
    document.getElementById("pieSearchFy").value = "";
    document.getElementById("pieSearchDistrict").value = "";
    document.getElementById("pieSearchSponsor").value = "";
    document.getElementById("pieSearchNieghborhood").value = "";
    const selectedAward = document.getElementById("awardRangeSelect").value;
    getDataByAmountRange(selectedAward);
  });
});
