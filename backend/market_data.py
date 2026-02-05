"""
Real-time Market Data Integration for ATLAS Supply Chain OS
Integrates: Yahoo Finance, Alpha Vantage, Finnhub
Focus: Supply Chain specific companies and data
"""

import asyncio
import aiohttp
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
import os
import json

# Supply Chain focused company tickers
SUPPLY_CHAIN_COMPANIES = {
    # Logistics & Transportation
    "FDX": {"name": "FedEx", "sector": "Logistics", "tier": 1},
    "UPS": {"name": "UPS", "sector": "Logistics", "tier": 1},
    "XPO": {"name": "XPO Logistics", "sector": "Logistics", "tier": 1},
    "CHRW": {"name": "C.H. Robinson", "sector": "Logistics", "tier": 2},
    "EXPD": {"name": "Expeditors International", "sector": "Logistics", "tier": 2},
    
    # Semiconductors (Critical Supply Chain)
    "TSM": {"name": "Taiwan Semiconductor", "sector": "Semiconductors", "tier": 1},
    "INTC": {"name": "Intel", "sector": "Semiconductors", "tier": 1},
    "NVDA": {"name": "NVIDIA", "sector": "Semiconductors", "tier": 1},
    "AMD": {"name": "AMD", "sector": "Semiconductors", "tier": 2},
    
    # Manufacturing
    "CAT": {"name": "Caterpillar", "sector": "Manufacturing", "tier": 1},
    "MMM": {"name": "3M Company", "sector": "Manufacturing", "tier": 1},
    "HON": {"name": "Honeywell", "sector": "Manufacturing", "tier": 1},
    "GE": {"name": "GE Aerospace", "sector": "Manufacturing", "tier": 2},
    
    # Retail & Consumer (Demand Signal)
    "WMT": {"name": "Walmart", "sector": "Retail", "tier": 1},
    "AMZN": {"name": "Amazon", "sector": "Retail", "tier": 1},
    "TGT": {"name": "Target", "sector": "Retail", "tier": 2},
    "COST": {"name": "Costco", "sector": "Retail", "tier": 2},
    
    # Raw Materials & Chemicals
    "BHP": {"name": "BHP Group", "sector": "Mining", "tier": 1},
    "RIO": {"name": "Rio Tinto", "sector": "Mining", "tier": 1},
    "DOW": {"name": "Dow Inc", "sector": "Chemicals", "tier": 1},
    "LYB": {"name": "LyondellBasell", "sector": "Chemicals", "tier": 2},
    
    # AI & Machine Learning
    "MSFT": {"name": "Microsoft", "sector": "AI", "tier": 1},
    "META": {"name": "Meta Platforms", "sector": "AI", "tier": 1},
    "CRM": {"name": "Salesforce", "sector": "AI", "tier": 2},
    "PLTR": {"name": "Palantir", "sector": "AI", "tier": 2},
    "AI": {"name": "C3.ai", "sector": "AI", "tier": 2},
    "SNOW": {"name": "Snowflake", "sector": "AI", "tier": 2},
    "PATH": {"name": "UiPath (RPA)", "sector": "AI", "tier": 2},
    
    # Robotics & Automation
    "ABB": {"name": "ABB Ltd", "sector": "Robotics", "tier": 1},
    "ROK": {"name": "Rockwell Automation", "sector": "Robotics", "tier": 1},
    "ISRG": {"name": "Intuitive Surgical", "sector": "Robotics", "tier": 1},
    "FANUY": {"name": "Fanuc Corp", "sector": "Robotics", "tier": 1},
    "IRBT": {"name": "iRobot", "sector": "Robotics", "tier": 2},
    "HYMO.F": {"name": "Hyundai (Boston Dynamics)", "sector": "Robotics", "tier": 1},
    "KUKA.DE": {"name": "KUKA AG", "sector": "Robotics", "tier": 2},
    "SNPS": {"name": "Synopsys (Robotics AI)", "sector": "Robotics", "tier": 2},
    
    # Autonomous Vehicles & Drones
    "TSLA": {"name": "Tesla", "sector": "Autonomous", "tier": 1},
    "RIVN": {"name": "Rivian", "sector": "Autonomous", "tier": 2},
    "GM": {"name": "General Motors (Cruise)", "sector": "Autonomous", "tier": 1},
    "F": {"name": "Ford (BlueCruise)", "sector": "Autonomous", "tier": 2},
    "TM": {"name": "Toyota", "sector": "Autonomous", "tier": 1},
    "UBER": {"name": "Uber (Autonomous)", "sector": "Autonomous", "tier": 2},
    "JOBY": {"name": "Joby Aviation", "sector": "Autonomous", "tier": 2},
    "ACHR": {"name": "Archer Aviation", "sector": "Autonomous", "tier": 2},
    "GOOGL": {"name": "Alphabet (Waymo)", "sector": "Autonomous", "tier": 1},
    "MBLY": {"name": "Mobileye (Intel)", "sector": "Autonomous", "tier": 1},
    "LAZR": {"name": "Luminar (LiDAR)", "sector": "Autonomous", "tier": 2},
    "INVZ": {"name": "Innoviz Technologies", "sector": "Autonomous", "tier": 2},
    "AEVA": {"name": "Aeva Technologies", "sector": "Autonomous", "tier": 2},
    "APTV": {"name": "Aptiv (Self-Driving)", "sector": "Autonomous", "tier": 1},
    
    # Energy & Utilities
    "XOM": {"name": "Exxon Mobil", "sector": "Energy", "tier": 1},
    "CVX": {"name": "Chevron", "sector": "Energy", "tier": 1},
    "NEE": {"name": "NextEra Energy", "sector": "Energy", "tier": 1},
    "ENPH": {"name": "Enphase Energy", "sector": "Energy", "tier": 2},
    "FSLR": {"name": "First Solar", "sector": "Energy", "tier": 2},
    "PLUG": {"name": "Plug Power", "sector": "Energy", "tier": 2},
    "BE": {"name": "Bloom Energy", "sector": "Energy", "tier": 2},
}

class YahooFinanceClient:
    """Yahoo Finance API client for stock and company data"""
    
    BASE_URL = "https://query1.finance.yahoo.com/v8/finance"
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    async def get_quote(self, symbol: str) -> Optional[Dict]:
        """Get real-time quote for a symbol"""
        url = f"{self.BASE_URL}/chart/{symbol}?interval=1d&range=5d"
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.HEADERS, timeout=10) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        result = data.get("chart", {}).get("result", [])
                        if result:
                            meta = result[0].get("meta", {})
                            indicators = result[0].get("indicators", {}).get("quote", [{}])[0]
                            closes = indicators.get("close", [])
                            
                            current_price = meta.get("regularMarketPrice", 0)
                            prev_close = meta.get("previousClose", current_price)
                            change_pct = ((current_price - prev_close) / prev_close * 100) if prev_close else 0
                            
                            return {
                                "symbol": symbol,
                                "price": round(current_price, 2),
                                "change": round(current_price - prev_close, 2),
                                "change_percent": round(change_pct, 2),
                                "volume": meta.get("regularMarketVolume", 0),
                                "market_cap": meta.get("marketCap", 0),
                                "fifty_two_week_high": meta.get("fiftyTwoWeekHigh", 0),
                                "fifty_two_week_low": meta.get("fiftyTwoWeekLow", 0),
                                "currency": meta.get("currency", "USD"),
                                "exchange": meta.get("exchangeName", ""),
                                "timestamp": datetime.now(timezone.utc).isoformat()
                            }
                    else:
                        print(f"Yahoo Finance returned status {resp.status} for {symbol}")
        except Exception as e:
            print(f"Yahoo Finance error for {symbol}: {e}")
        return None
    
    async def get_multiple_quotes(self, symbols: List[str]) -> Dict[str, Dict]:
        """Get quotes for multiple symbols concurrently"""
        tasks = [self.get_quote(symbol) for symbol in symbols]
        results = await asyncio.gather(*tasks)
        return {symbols[i]: r for i, r in enumerate(results) if r}


class AlphaVantageClient:
    """Alpha Vantage API client for forex and commodities"""
    
    BASE_URL = "https://www.alphavantage.co/query"
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("ALPHA_VANTAGE_KEY", "demo")
    
    async def get_forex_rate(self, from_currency: str, to_currency: str) -> Optional[Dict]:
        """Get real-time forex exchange rate"""
        params = {
            "function": "CURRENCY_EXCHANGE_RATE",
            "from_currency": from_currency,
            "to_currency": to_currency,
            "apikey": self.api_key
        }
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.BASE_URL, params=params, timeout=10) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        rate_data = data.get("Realtime Currency Exchange Rate", {})
                        if rate_data:
                            return {
                                "from": from_currency,
                                "to": to_currency,
                                "rate": float(rate_data.get("5. Exchange Rate", 0)),
                                "bid": float(rate_data.get("8. Bid Price", 0)),
                                "ask": float(rate_data.get("9. Ask Price", 0)),
                                "timestamp": rate_data.get("6. Last Refreshed", "")
                            }
        except Exception as e:
            print(f"Alpha Vantage error: {e}")
        return None
    
    async def get_supply_chain_forex(self) -> Dict[str, Dict]:
        """Get forex rates relevant to supply chain (USD vs major trading currencies)"""
        pairs = [("USD", "CNY"), ("USD", "EUR"), ("USD", "JPY"), ("USD", "MXN"), ("USD", "KRW")]
        tasks = [self.get_forex_rate(f, t) for f, t in pairs]
        results = await asyncio.gather(*tasks)
        return {f"{p[0]}/{p[1]}": r for p, r in zip(pairs, results) if r}


class FinnhubClient:
    """Finnhub API client for news and company data"""
    
    BASE_URL = "https://finnhub.io/api/v1"
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("FINNHUB_KEY", "")
    
    async def get_company_news(self, symbol: str, days: int = 7) -> List[Dict]:
        """Get recent news for a company"""
        from datetime import timedelta
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        params = {
            "symbol": symbol,
            "from": start_date.strftime("%Y-%m-%d"),
            "to": end_date.strftime("%Y-%m-%d"),
            "token": self.api_key
        }
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.BASE_URL}/company-news", params=params, timeout=10) as resp:
                    if resp.status == 200:
                        news = await resp.json()
                        return [{
                            "headline": item.get("headline", ""),
                            "summary": item.get("summary", ""),
                            "source": item.get("source", ""),
                            "url": item.get("url", ""),
                            "datetime": datetime.fromtimestamp(item.get("datetime", 0)).isoformat(),
                            "sentiment": self._analyze_headline_sentiment(item.get("headline", ""))
                        } for item in news[:10]]  # Limit to 10 recent
        except Exception as e:
            print(f"Finnhub error for {symbol}: {e}")
        return []
    
    def _analyze_headline_sentiment(self, headline: str) -> str:
        """Simple sentiment analysis on headlines"""
        negative_words = ["fall", "drop", "crash", "loss", "decline", "risk", "warning", "cut", "layoff", "shortage", "delay", "crisis"]
        positive_words = ["rise", "gain", "surge", "growth", "profit", "record", "boost", "expand", "deal", "partnership"]
        
        headline_lower = headline.lower()
        neg_count = sum(1 for w in negative_words if w in headline_lower)
        pos_count = sum(1 for w in positive_words if w in headline_lower)
        
        if neg_count > pos_count:
            return "negative"
        elif pos_count > neg_count:
            return "positive"
        return "neutral"
    
    async def get_supply_chain_news(self) -> List[Dict]:
        """Get aggregated news for supply chain companies"""
        key_symbols = ["FDX", "TSM", "CAT", "WMT", "BHP"]
        all_news = []
        
        for symbol in key_symbols:
            news = await self.get_company_news(symbol, days=3)
            for item in news:
                item["symbol"] = symbol
                item["company"] = SUPPLY_CHAIN_COMPANIES.get(symbol, {}).get("name", symbol)
            all_news.extend(news)
        
        # Sort by datetime, newest first
        all_news.sort(key=lambda x: x.get("datetime", ""), reverse=True)
        return all_news[:20]


class SupplyChainDataService:
    """Main service to aggregate supply chain market data"""
    
    def __init__(self, alpha_vantage_key: str = None, finnhub_key: str = None):
        self.yahoo = YahooFinanceClient()
        self.alpha_vantage = AlphaVantageClient(alpha_vantage_key)
        self.finnhub = FinnhubClient(finnhub_key)
    
    async def get_supply_chain_dashboard(self) -> Dict[str, Any]:
        """Get comprehensive supply chain market data"""
        symbols = list(SUPPLY_CHAIN_COMPANIES.keys())
        
        # Fetch data concurrently
        quotes_task = self.yahoo.get_multiple_quotes(symbols)
        # forex_task = self.alpha_vantage.get_supply_chain_forex()  # Uncomment if API key available
        # news_task = self.finnhub.get_supply_chain_news()  # Uncomment if API key available
        
        quotes = await quotes_task
        
        # Calculate sector performance
        sector_performance = {}
        for symbol, quote in quotes.items():
            company_info = SUPPLY_CHAIN_COMPANIES.get(symbol, {})
            sector = company_info.get("sector", "Other")
            if sector not in sector_performance:
                sector_performance[sector] = {"total_change": 0, "count": 0, "companies": []}
            sector_performance[sector]["total_change"] += quote.get("change_percent", 0)
            sector_performance[sector]["count"] += 1
            sector_performance[sector]["companies"].append({
                "symbol": symbol,
                "name": company_info.get("name", symbol),
                "price": quote.get("price", 0),
                "change_percent": quote.get("change_percent", 0)
            })
        
        # Calculate average change per sector
        for sector in sector_performance:
            count = sector_performance[sector]["count"]
            if count > 0:
                sector_performance[sector]["avg_change"] = round(
                    sector_performance[sector]["total_change"] / count, 2
                )
        
        # Identify risk alerts based on significant price drops
        risk_alerts = []
        for symbol, quote in quotes.items():
            change_pct = quote.get("change_percent", 0)
            if change_pct < -3:  # More than 3% drop
                company_info = SUPPLY_CHAIN_COMPANIES.get(symbol, {})
                risk_alerts.append({
                    "id": f"ra-{symbol}",
                    "severity": "high" if change_pct < -5 else "medium",
                    "supplier": company_info.get("name", symbol),
                    "symbol": symbol,
                    "issue": f"Stock down {abs(change_pct):.1f}% - potential financial stress",
                    "change_percent": change_pct,
                    "price": quote.get("price", 0),
                    "probability": min(0.9, abs(change_pct) / 10),
                    "sector": company_info.get("sector", "Unknown"),
                    "tier": company_info.get("tier", 2)
                })
        
        # Sort risk alerts by severity
        risk_alerts.sort(key=lambda x: x.get("change_percent", 0))
        
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "quotes": quotes,
            "sector_performance": sector_performance,
            "risk_alerts": risk_alerts[:10],  # Top 10 risks
            "market_summary": {
                "total_companies_tracked": len(quotes),
                "sectors_monitored": list(sector_performance.keys()),
                "alerts_active": len(risk_alerts)
            }
        }
    
    async def get_company_risk_profile(self, symbol: str) -> Optional[Dict]:
        """Get detailed risk profile for a specific company"""
        quote = await self.yahoo.get_quote(symbol)
        if not quote:
            return None
        
        company_info = SUPPLY_CHAIN_COMPANIES.get(symbol, {"name": symbol, "sector": "Unknown", "tier": 2})
        
        # Calculate risk score based on price volatility
        price = quote.get("price", 0)
        high_52 = quote.get("fifty_two_week_high", price)
        low_52 = quote.get("fifty_two_week_low", price)
        
        volatility = ((high_52 - low_52) / low_52 * 100) if low_52 > 0 else 0
        price_vs_high = ((high_52 - price) / high_52 * 100) if high_52 > 0 else 0
        
        risk_score = min(100, max(0, (volatility / 2) + (price_vs_high / 2)))
        
        return {
            "symbol": symbol,
            "name": company_info.get("name"),
            "sector": company_info.get("sector"),
            "tier": company_info.get("tier"),
            "current_price": price,
            "change_percent": quote.get("change_percent", 0),
            "fifty_two_week_high": high_52,
            "fifty_two_week_low": low_52,
            "price_vs_52_high": round(price_vs_high, 1),
            "volatility_index": round(volatility, 1),
            "risk_score": round(risk_score, 0),
            "risk_level": "HIGH" if risk_score > 60 else "MEDIUM" if risk_score > 30 else "LOW",
            "timestamp": quote.get("timestamp")
        }


# Singleton instance
_data_service = None

def get_data_service(alpha_vantage_key: str = None, finnhub_key: str = None) -> SupplyChainDataService:
    global _data_service
    if _data_service is None:
        _data_service = SupplyChainDataService(alpha_vantage_key, finnhub_key)
    return _data_service
