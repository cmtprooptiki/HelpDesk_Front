import { useState,useRef } from "react";
import axios from "axios";
import apiBaseUrl from "../../api_config";
import { InputTextarea } from "primereact/inputtextarea";
import Chart from "react-apexcharts";
import { Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ImageRun} from "docx";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

function ReportAssistant() {
  const [rawJson, setRawJson] = useState("");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(); // ✅ Declare it inside your component
const [analysis, setAnalysis] = useState("");

  
const [selectedMonth, setSelectedMonth] = useState(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
});

  const handleGroup = async () => {
    setLoading(true);
    setRawJson("");
    setChartData(null);

    try {
      const response = await axios.get(`${apiBaseUrl}/reports/assistant?month=${selectedMonth}`);

      const json = response.data;

      // Pretty-print for textarea
      setRawJson(JSON.stringify(json, null, 2));

      // Prepare Apex chart data
      const series = json.map((group) => group.count);
      const labels = json.map((group) => group.group_name);

      setChartData({
        options: {
          chart: {
            type: "pie"
          },
          labels
        },
        series
      });

    } catch (err) {
      console.error(err);
      setRawJson("❌ Failed to load grouping results.");
    } finally {
      setLoading(false);
    }
  };


  const generateAnalysis = async () => {
  setAnalysis("🔄 Generating analysis...");
  try {
    const postData = chartData.series.map((count, i) => ({
      group_name: chartData.options.labels[i],
      count
    }));

    const response = await axios.post(`${apiBaseUrl}/reports/analyze`, {
      data: postData
    });

    setAnalysis(response.data.analysis);
  } catch (err) {
    console.error("Analysis error", err);
    setAnalysis("❌ Failed to generate insights.");
  }
};

//   const exportToDocx = async () => {
//     if (!rawJson) return;

//     const doc = new Document({
//       sections: [
//         {
//           properties: {},
//           children: [
//             new Paragraph({
//               children: [
//                 new TextRun("AI Issue Grouping Report"),
//                 new TextRun("\n"),
//               ],
//             }),
//             ...rawJson.split("\n").map(
//               (line) =>
//                 new Paragraph({
//                   children: [new TextRun({ text: line, font: "Courier New" })],
//                 })
//             ),
//           ],
//         },
//       ],
//     });

//     const blob = await Packer.toBlob(doc);
//     saveAs(blob, "report.docx");
//   };




const exportToDocx = async () => {
  if (!rawJson) return;

  const jsonData = JSON.parse(rawJson); // Convert back to usable array

  // 🧾 Build a table with group_name, issue_ids, count
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Group Name")] }),
        new TableCell({ children: [new Paragraph("Issue IDs")] }),
        new TableCell({ children: [new Paragraph("Count")] }),
      ],
    }),
    ...jsonData.map((item) =>
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: item.group_name, font: "Calibri", size: 22 })],
            })],
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: item.issue_ids.join(", "), font: "Calibri", size: 22 })],
            })],
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: String(item.amount || item.count), font: "Calibri", size: 22 })],
            })],
          }),
        ],
      })
    ),
  ];

  const docChildren = [
    new Paragraph({
      children: [
        new TextRun({
          text: "AI Issue Grouping Report",
          bold: true,
          size: 28,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({ text: "\n" }),
    new Table({
      rows: tableRows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    }),
  ];

  // 🖼️ Chart image if available
  if (chartRef.current) {
    const canvas = await html2canvas(chartRef.current);
    const imgDataUrl = canvas.toDataURL("image/png");
    const imgBase64 = imgDataUrl.replace(/^data:image\/png;base64,/, "");

    docChildren.push(
      new Paragraph({ text: "\nChart:", spacing: { before: 200, after: 100 } }),
      new Paragraph({
        children: [
          new ImageRun({
            data: Uint8Array.from(atob(imgBase64), c => c.charCodeAt(0)),
            transformation: {
              width: 500,
              height: 300,
            },
          }),
        ],
      })
    );
  }

  // 🧠 AI Insights if present
  if (analysis) {
    docChildren.push(
      new Paragraph({
        spacing: { before: 200 },
        children: [new TextRun({ text: "AI Insights:", bold: true, size: 24, font: "Calibri" })],
      }),
      ...analysis.split("\n").map((line) =>
        new Paragraph({
          children: [new TextRun({ text: line, font: "Calibri", size: 22 })],
        })
      )
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "report.docx");
};


// const exportToDocx = async () => {
//   if (!rawJson) return;

//   const docChildren = [
//     new Paragraph({
//       children: [
//         new TextRun({
//           text: "AI Issue Grouping Report",
//           bold: true,
//           size: 28
//         }),
//         new TextRun("\n")
//       ]
//     }),
//     ...rawJson.split("\n").map(
//       (line) =>
//         new Paragraph({
//           children: [new TextRun({ text: line, font: "Courier New" })],
//         })
//     ),
//   ];

//   // 🖼️ Add chart image if exists
//   if (chartRef.current) {
//     const canvas = await html2canvas(chartRef.current);
//     const imgDataUrl = canvas.toDataURL("image/png");
//     const imgBase64 = imgDataUrl.replace(/^data:image\/png;base64,/, "");

//     docChildren.push(
//       new Paragraph({
//         children: [new TextRun("\nChart:\n")]
//       }),
//       new Paragraph({
//         children: [
//           new ImageRun({
//             data: Uint8Array.from(atob(imgBase64), c => c.charCodeAt(0)),
//             transformation: {
//               width: 500,
//               height: 300,
//             }
//           })
//         ]
//       })
//     );
//   }

//   if (analysis) {
//   docChildren.push(
//     new Paragraph({
//       children: [
//         new TextRun({ text: "\nAI Insights:", bold: true, size: 24 })
//       ]
//     }),
//     ...analysis.split("\n").map(
//       (line) =>
//         new Paragraph({
//           children: [new TextRun({ text: line })],
//         })
//     )
//   );
// }


//   const doc = new Document({
//     sections: [
//       {
//         properties: {},
//         children: docChildren
//       }
//     ]
//   });

//   const blob = await Packer.toBlob(doc);
//   saveAs(blob, "report.docx");
// };


  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">AI Issue Grouping Report</h1>
   <div className="mb-4">
  <label className="font-medium mr-2">Select Month:</label>
  <input
    type="month"
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
    className="border rounded px-2 py-1"
  />
</div>
      <button
        onClick={handleGroup}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Processing..." : "Generate Report"}
      </button>

      <button
  onClick={generateAnalysis}
  disabled={!chartData}
  className="ml-2 px-4 py-2 bg-purple-600 text-white rounded"
>
  Generate Insights
</button>
      <button
  onClick={exportToDocx}
  disabled={!rawJson}
  className="ml-2 px-4 py-2 bg-green-600 text-white rounded"
>
  Export to .docx
</button>


      {rawJson && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">📋 JSON Output:</h2>
          <InputTextarea value={rawJson} rows={12} className="w-full" readOnly autoResize />
        </div>
      )}

      {chartData && (
        <div className="mt-8">
          <h2 className="font-semibold mb-2">📊 Group Distribution:</h2>
        <div ref={chartRef}>

          <Chart
            options={chartData.options}
            series={chartData.series}
            type="pie"
            width="50%"
          />
        </div>
        </div>
      )}

      {analysis && (
  <div className="mt-8">
    <h2 className="font-semibold mb-2">🧠 AI Insights:</h2>
    <p className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{analysis}</p>
  </div>
)}
    </div>
  );
}

export default ReportAssistant;
