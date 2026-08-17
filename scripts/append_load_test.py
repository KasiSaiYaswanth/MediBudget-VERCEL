import openpyxl

file_path = 'test-reports/Load_Performance_300_TestCases_Analysis_Report.xlsx'
wb = openpyxl.load_workbook(file_path)
sheet = wb.active

max_row = sheet.max_row

# Append the new results
results = [
    ["", "", "", "", "", ""],
    ["RECENT BACKEND LOAD TEST RESULTS (AUTOCANNON)", "", "", "", "", ""],
    ["Target Endpoint", "https://cpifzrvgsmoicginrkgj.supabase.co/rest/v1/government_schemes", "", "", "", ""],
    ["Concurrency", "5 simultaneous connections", "", "", "", ""],
    ["Duration", "10 seconds", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["Latency Metrics", "Value (ms)", "", "Throughput & Reliability", "Value", ""],
    ["Minimum Latency", 132, "", "Total Requests", 56, ""],
    ["Maximum Latency", 686, "", "Requests per Second (avg)", 5.1, ""],
    ["Average (Mean)", 593.68, "", "Data Transferred", "56.5 kB", ""],
    ["Median (p50)", 585, "", "Non-2xx Responses (Errors)", 51, ""],
    ["90th Percentile (p90)", 686, "", "Error Rate", "91%", ""],
    ["99th Percentile (p99)", 686, "", "Note", "Errors likely due to RLS/Rate Limiting", ""]
]

for row_data in results:
    sheet.append(row_data)

wb.save(file_path)
print(f"Successfully appended load test results to {file_path}")
