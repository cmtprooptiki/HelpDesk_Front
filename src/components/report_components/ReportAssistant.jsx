import { useState } from "react";
import axios from "axios";
import apiBaseUrl from "../../api_config";
import { InputTextarea } from "primereact/inputtextarea";
import Chart from "react-apexcharts";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";


function ReportAssistant() {
  const [rawJson, setRawJson] = useState("");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  

  const handleGroup = async () => {
    setLoading(true);
    setRawJson("");
    setChartData(null);

    try {
      const response = await axios.get(`${apiBaseUrl}/reports/assistant`);

      const json = response.data;

      // Pretty-print for textarea
      setRawJson(JSON.stringify(json, null, 2));

      // Prepare Apex chart data
      const series = json.map((group) => group.amount);
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

  const exportToDocx = async () => {
    if (!rawJson) return;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun("AI Issue Grouping Report"),
                new TextRun("\n"),
              ],
            }),
            ...rawJson.split("\n").map(
              (line) =>
                new Paragraph({
                  children: [new TextRun({ text: line, font: "Courier New" })],
                })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "report.docx");
  };


  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">AI Issue Grouping Report</h1>
      
      <button
        onClick={handleGroup}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Processing..." : "Generate Report"}
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
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="pie"
            width="100%"
          />
        </div>
      )}
    </div>
  );
}

export default ReportAssistant;
