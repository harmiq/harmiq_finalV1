import pandas as pd
import sys

file_path = r'E:\harmiq_viaje\harmiq.app-Performance-on-Search-2026-04-03.xlsx'

try:
    # Cargar el reporte
    xl = pd.ExcelFile(file_path)
    print(f"Hojas disponibles: {xl.sheet_names}")
    
    # Analizar queries
    if 'Queries' in xl.sheet_names:
        df = pd.read_excel(file_path, sheet_name='Queries')
        # Limpiar datos
        df = df.sort_values(by='Impressions', ascending=False)
        print("\n--- TOP 10 QUERIES POR IMPRESIONES ---")
        print(df[['Query', 'Impressions', 'Clicks', 'CTR']].head(10).to_string(index=False))
        
    # Analizar páginas
    if 'Pages' in xl.sheet_names:
        df_p = pd.read_excel(file_path, sheet_name='Pages')
        df_p = df_p.sort_values(by='Clicks', ascending=False)
        print("\n--- TOP 5 PÁGINAS MÁS TRENDING ---")
        print(df_p[['Page', 'Clicks', 'Impressions']].head(5).to_string(index=False))

except Exception as e:
    print(f"ERROR: {str(e)}")
