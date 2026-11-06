#!/usr/bin/env python3
"""
Phone Number Recon Tool (OSINT)
================================
Cybersecurity student project — pulls PUBLIC metadata about a phone number:
country, region/circle, carrier/operator, timezone, number type, and format
validity. This does NOT do real-time GPS tracking or reveal a person's live
location — that data is private and only accessible to telecom/law
enforcement with legal authority.

Dependencies:
    pip install phonenumbers

Usage:
    python phone_recon.py +919876543210
    python phone_recon.py 9876543210 --region IN
"""

import argparse
import sys

try:
    import phonenumbers
    from phonenumbers import geocoder, carrier, timezone as tz_module
except ImportError:
    print("[!] 'phonenumbers' library not found.")
    print("    Install it with: pip install phonenumbers")
    sys.exit(1)


# ----------------------------- Core Logic -----------------------------

def analyze_number(raw_number: str, default_region: str = "IN") -> dict:
    """Parse and extract all available public metadata for a phone number."""

    try:
        parsed = phonenumbers.parse(raw_number, default_region)
    except phonenumbers.NumberParseException as e:
        return {"error": f"Could not parse number: {e}"}

    result = {}

    # --- Basic ---
    result["input"] = raw_number
    result["e164_format"] = phonenumbers.format_number(
        parsed, phonenumbers.PhoneNumberFormat.E164
    )
    result["international_format"] = phonenumbers.format_number(
        parsed, phonenumbers.PhoneNumberFormat.INTERNATIONAL
    )
    result["national_format"] = phonenumbers.format_number(
        parsed, phonenumbers.PhoneNumberFormat.NATIONAL
    )
    result["country_code"] = f"+{parsed.country_code}"
    result["national_number"] = parsed.national_number

    # --- Validity checks ---
    result["is_valid"] = phonenumbers.is_valid_number(parsed)
    result["is_possible"] = phonenumbers.is_possible_number(parsed)

    # --- Number type (mobile / landline / voip / toll-free etc.) ---
    num_type = phonenumbers.number_type(parsed)
    type_map = {
        phonenumbers.PhoneNumberType.MOBILE: "Mobile",
        phonenumbers.PhoneNumberType.FIXED_LINE: "Fixed Line",
        phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE: "Fixed Line or Mobile",
        phonenumbers.PhoneNumberType.TOLL_FREE: "Toll Free",
        phonenumbers.PhoneNumberType.PREMIUM_RATE: "Premium Rate",
        phonenumbers.PhoneNumberType.SHARED_COST: "Shared Cost",
        phonenumbers.PhoneNumberType.VOIP: "VoIP",
        phonenumbers.PhoneNumberType.PERSONAL_NUMBER: "Personal Number",
        phonenumbers.PhoneNumberType.PAGER: "Pager",
        phonenumbers.PhoneNumberType.UAN: "UAN",
        phonenumbers.PhoneNumberType.UNKNOWN: "Unknown",
    }
    result["number_type"] = type_map.get(num_type, "Unknown")

    # --- Location (region-level, NOT GPS) ---
    result["region_description"] = geocoder.description_for_number(parsed, "en")
    result["country_region_code"] = phonenumbers.region_code_for_number(parsed)

    # --- Carrier / Operator ---
    result["carrier_name"] = carrier.name_for_number(parsed, "en") or "Unavailable (may be ported/VoIP)"

    # --- Timezone(s) ---
    result["timezones"] = list(tz_module.time_zones_for_number(parsed))

    return result


# ----------------------------- Display -----------------------------

def print_report(data: dict):
    if "error" in data:
        print(f"[!] {data['error']}")
        return

    line = "=" * 55
    print(line)
    print(" PHONE NUMBER RECON REPORT")
    print(line)

    print("\n[ BASIC INFO ]")
    print(f"  Input Given        : {data['input']}")
    print(f"  E.164 Format       : {data['e164_format']}")
    print(f"  International      : {data['international_format']}")
    print(f"  National Format    : {data['national_format']}")
    print(f"  Country Code       : {data['country_code']}")

    print("\n[ VALIDITY ]")
    print(f"  Valid Number?      : {data['is_valid']}")
    print(f"  Possible Number?   : {data['is_possible']}")
    print(f"  Number Type        : {data['number_type']}")

    print("\n[ LOCATION (region-level, not GPS) ]")
    print(f"  Region/Circle      : {data['region_description'] or 'Unknown'}")
    print(f"  Country Code (ISO) : {data['country_region_code']}")

    print("\n[ NETWORK / CARRIER ]")
    print(f"  Carrier            : {data['carrier_name']}")

    print("\n[ TIMEZONE ]")
    tzones = ", ".join(data["timezones"]) if data["timezones"] else "Unknown"
    print(f"  Timezone(s)        : {tzones}")

    print(line)
    print(" Note: This is public metadata from number formatting databases.")
    print(" No live/GPS tracking is performed or possible with this tool.")
    print(line)


# ----------------------------- CLI -----------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Phone Number OSINT Recon Tool (public metadata only)"
    )
    parser.add_argument("number", help="Phone number, e.g. +919876543210 or 9876543210")
    parser.add_argument(
        "--region",
        default="IN",
        help="Default region code (ISO 3166) used if number has no country code, e.g. IN, US",
    )
    args = parser.parse_args()

    data = analyze_number(args.number, default_region=args.region)
    print_report(data)


if __name__ == "__main__":
    main()