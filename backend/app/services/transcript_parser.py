import re
from typing import List, Dict, Any


def parse_transcript_text(raw_text: str) -> List[Dict[str, Any]]:
    """
    Parses formatted transcript text into structured segment dictionaries.
    Supported line formats:
      [00:12] Speaker Name: Dialogue text
      00:12 Speaker Name: Dialogue text
      Speaker Name: Dialogue text
    """
    if not raw_text or not raw_text.strip():
        return []

    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    segments = []
    
    # Regex patterns
    # Matches: [00:12] Speaker: Text or 00:12 Speaker: Text
    pattern_time_speaker = re.compile(r'^(?:\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s+)?([^:]+):\s*(.+)$')

    current_time = 0.0

    for idx, line in enumerate(lines):
        match = pattern_time_speaker.match(line)
        if match:
            time_str, speaker_name, text = match.groups()
            
            if time_str:
                parts = [float(p) for p in time_str.split(":")]
                if len(parts) == 2:
                    current_time = parts[0] * 60.0 + parts[1]
                elif len(parts) == 3:
                    current_time = parts[0] * 3600.0 + parts[1] * 60.0 + parts[2]
            
            start_time = current_time
            # Estimate duration based on text length (~15 chars/sec)
            estimated_duration = max(3.0, round(len(text) / 15.0, 1))
            end_time = start_time + estimated_duration
            current_time = end_time

            segments.append({
                "speaker_name": speaker_name.strip(),
                "start_time": start_time,
                "end_time": end_time,
                "text": text.strip(),
                "sequence_order": idx
            })
        else:
            # Fallback for plain lines without explicit speaker
            start_time = current_time
            estimated_duration = max(3.0, round(len(line) / 15.0, 1))
            end_time = start_time + estimated_duration
            current_time = end_time

            segments.append({
                "speaker_name": "Speaker 1",
                "start_time": start_time,
                "end_time": end_time,
                "text": line.strip(),
                "sequence_order": idx
            })

    return segments
