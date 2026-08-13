import datetime
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import User, Meeting, Participant, TranscriptSegment, Summary, OutlineItem, ActionItem


def seed_database():
    print("[SEED] Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        print("[SEED] Clearing existing seed data...")
        db.query(ActionItem).delete()
        db.query(OutlineItem).delete()
        db.query(Summary).delete()
        db.query(TranscriptSegment).delete()
        db.query(Participant).delete()
        db.query(Meeting).delete()
        db.query(User).delete()
        db.commit()

        print("[SEED] Creating primary user...")
        alex = User(
            name="Alex Chen",
            email="alex@echonotes.ai",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        )
        db.add(alex)
        db.commit()
        db.refresh(alex)

        now = datetime.datetime.utcnow()

        # ==========================================
        # Meeting 1: Sprint Planning — Q3
        # ==========================================
        print("[SEED] Seeding Meeting 1: Sprint Planning -- Q3...")
        m1 = Meeting(
            title="Sprint Planning — Q3",
            date=now - datetime.timedelta(days=1, hours=2),
            duration_seconds=115,  # 01:55 total audio
            audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            owner_id=alex.id
        )
        db.add(m1)
        db.commit()

        p1_alex = Participant(meeting_id=m1.id, name="Alex Chen", avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", is_speaker=True)
        p1_jordan = Participant(meeting_id=m1.id, name="Jordan Taylor", avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", is_speaker=True)
        p1_maya = Participant(meeting_id=m1.id, name="Maya Lin", avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", is_speaker=True)
        p1_sam = Participant(meeting_id=m1.id, name="Sam Rivera", avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", is_speaker=True)
        db.add_all([p1_alex, p1_jordan, p1_maya, p1_sam])
        db.commit()

        m1_segments_data = [
            (p1_alex.id, 0.0, 6.5, "Alright everyone, let me quickly share my screen and kick off our Q3 Sprint Planning session.", 0),
            (p1_jordan.id, 6.8, 13.2, "Sounds good Alex. Before we dive into tickets, did we resolve the API rate limiting issue from yesterday's release?", 1),
            (p1_alex.id, 13.5, 20.1, "Yeah, Sam pushed a hotfix last night around 9 PM. Rates are back down to baseline now.", 2),
            (p1_sam.id, 20.4, 28.0, "That's right. The issue was unindexed user queries causing Redis lookup timeouts during spike traffic.", 3),
            (p1_maya.id, 28.3, 36.2, "Awesome work Sam! On the frontend side, we're ready to start building the new transcript player controls.", 4),
            (p1_alex.id, 36.5, 44.1, "Great. Maya, what's our timeline for the audio scrubber sync and active segment highlighting?", 5),
            (p1_maya.id, 44.5, 53.0, "I estimate about 3 days. We need to make sure timeupdate throttling doesn't lag the UI during rapid seeks.", 6),
            (p1_jordan.id, 53.3, 62.1, "Let's use a binary search lookup over segment start times instead of array scan for 60fps scrolling.", 7),
            (p1_sam.id, 62.4, 70.8, "I'll also ensure the GET /transcript endpoint returns segments sorted by sequence_order for clean indexing.", 8),
            (p1_alex.id, 71.0, 78.5, "Perfect. Jordan, can you take ownership of the Alembic schema migrations for action item assignments?", 9),
            (p1_jordan.id, 78.8, 85.0, "Will do. I'll have the migration pull request ready by tomorrow morning standup.", 10),
            (p1_maya.id, 85.3, 93.2, "Let's also schedule a quick design review for the tablet layout breakdown on Thursday.", 11),
            (p1_alex.id, 93.5, 101.0, "Agreed. I'll drop a calendar invite for Thursday at 2 PM. Any other blockers before we commit sprint points?", 12),
            (p1_sam.id, 101.3, 108.2, "None from backend. We're fully locked in for Sprint 14.", 13),
            (p1_alex.id, 108.5, 115.0, "Awesome team! Let's wrap it up and get to building. Thanks everyone!", 14),
        ]

        m1_segments = []
        for s in m1_segments_data:
            seg = TranscriptSegment(meeting_id=m1.id, speaker_id=s[0], start_time=s[1], end_time=s[2], text=s[3], sequence_order=s[4])
            db.add(seg)
            m1_segments.append(seg)
        db.commit()

        db.add(Summary(
            meeting_id=m1.id,
            overview_text="The team reviewed yesterday's API rate limiting hotfix, which successfully reduced Redis query latency. Key sprint priorities for Q3 include frontend transcript player audio sync, binary search optimization for active segment auto-scroll, and Alembic database migration for action items.",
            source="mock"
        ))

        db.add_all([
            OutlineItem(meeting_id=m1.id, title="Sprint Kickoff & Hotfix Review", start_time=0.0, sequence_order=0),
            OutlineItem(meeting_id=m1.id, title="Frontend Transcript Player Scope", start_time=28.3, sequence_order=1),
            OutlineItem(meeting_id=m1.id, title="Performance Optimization Strategy", start_time=53.3, sequence_order=2),
            OutlineItem(meeting_id=m1.id, title="Sprint Commitments & Wrap-up", start_time=93.5, sequence_order=3),
        ])

        db.add_all([
            ActionItem(meeting_id=m1.id, text="Submit Alembic migration PR for action item assignments", assignee_id=p1_jordan.id, is_completed=False, source_segment_id=m1_segments[10].id),
            ActionItem(meeting_id=m1.id, text="Build transcript player audio scrubber and timeupdate hook", assignee_id=p1_maya.id, is_completed=True, source_segment_id=m1_segments[6].id),
            ActionItem(meeting_id=m1.id, text="Ensure transcript segments returned sorted by sequence_order", assignee_id=p1_sam.id, is_completed=False, source_segment_id=m1_segments[8].id),
            ActionItem(meeting_id=m1.id, text="Send Thursday design review invite for tablet UI", assignee_id=p1_alex.id, is_completed=True, source_segment_id=m1_segments[12].id),
        ])

        # ==========================================
        # Meeting 2: Client Kickoff: Acme Corp
        # ==========================================
        print("[SEED] Seeding Meeting 2: Client Kickoff: Acme Corp...")
        m2 = Meeting(
            title="Client Kickoff: Acme Corp",
            date=now - datetime.timedelta(days=3, hours=5),
            duration_seconds=120,
            audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            owner_id=alex.id
        )
        db.add(m2)
        db.commit()

        p2_alex = Participant(meeting_id=m2.id, name="Alex Chen", avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", is_speaker=True)
        p2_sarah = Participant(meeting_id=m2.id, name="Sarah Jenkins", avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", is_speaker=True)
        p2_marcus = Participant(meeting_id=m2.id, name="Marcus Vance", avatar_url="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150", is_speaker=True)
        db.add_all([p2_alex, p2_sarah, p2_marcus])
        db.commit()

        m2_segments_data = [
            (p2_alex.id, 0.0, 7.1, "Welcome Sarah and Marcus! We're thrilled to kick off Acme Corp's enterprise pilot program with EchoNotes today.", 0),
            (p2_sarah.id, 7.5, 14.8, "Thanks Alex! Our team is really excited. We have about 120 project managers who struggle with meeting note retention.", 1),
            (p2_marcus.id, 15.2, 23.0, "From an IT perspective, our main priorities are SAML SSO integration and SOC2 compliance validation.", 2),
            (p2_alex.id, 23.4, 31.9, "Absolutely Marcus. We support Okta and Azure AD SSO out of the box. I'll send over our compliance package right after this call.", 3),
            (p2_sarah.id, 32.2, 40.5, "Great. What does the onboarding timeline look like for our initial batch of 30 beta users?", 4),
            (p2_alex.id, 40.9, 49.6, "We usually complete provisioning within 48 hours once SSO metadata is configured.", 5),
            (p2_marcus.id, 50.0, 58.3, "I can upload the IDP metadata XML file into the admin portal by tomorrow afternoon.", 6),
            (p2_sarah.id, 58.7, 67.2, "Fantastic. We'd also like a custom training webinar for our department leads next Tuesday.", 7),
            (p2_alex.id, 67.6, 75.4, "Done! I'll reserve Tuesday 10 AM EST for the team training and send out calendar invites.", 8),
            (p2_marcus.id, 75.8, 83.1, "Is there an export option for meeting transcripts to Markdown and PDF for archival?", 9),
            (p2_alex.id, 83.5, 92.0, "Yes! Users can export full transcripts, summaries, and action items in Markdown, TXT, or PDF formats directly.", 10),
            (p2_sarah.id, 92.4, 100.5, "That sounds like exactly what our documentation policy requires. Looking forward to our launch!", 11),
            (p2_alex.id, 101.0, 110.0, "Wonderful! Thanks Sarah and Marcus, talk soon!", 12),
        ]

        m2_segments = []
        for s in m2_segments_data:
            seg = TranscriptSegment(meeting_id=m2.id, speaker_id=s[0], start_time=s[1], end_time=s[2], text=s[3], sequence_order=s[4])
            db.add(seg)
            m2_segments.append(seg)
        db.commit()

        db.add(Summary(
            meeting_id=m2.id,
            overview_text="Kickoff meeting with Acme Corp leadership to launch an enterprise pilot for 120 PMs. IT requirements focused on Okta/Azure SAML SSO integration and SOC2 documentation. The pilot launch is scheduled following next Tuesday's live training webinar.",
            source="mock"
        ))

        db.add_all([
            OutlineItem(meeting_id=m2.id, title="Introductions & Pilot Overview", start_time=0.0, sequence_order=0),
            OutlineItem(meeting_id=m2.id, title="IT Security & SAML SSO Integration", start_time=15.2, sequence_order=1),
            OutlineItem(meeting_id=m2.id, title="User Provisioning & Training Webinar", start_time=32.2, sequence_order=2),
            OutlineItem(meeting_id=m2.id, title="Export Formats & Archival Policy", start_time=75.8, sequence_order=3),
        ])

        db.add_all([
            ActionItem(meeting_id=m2.id, text="Send SOC2 compliance documentation package to Marcus", assignee_id=p2_alex.id, is_completed=True, source_segment_id=m2_segments[3].id),
            ActionItem(meeting_id=m2.id, text="Configure Azure AD SAML IDP metadata in portal", assignee_id=p2_marcus.id, is_completed=False, source_segment_id=m2_segments[6].id),
            ActionItem(meeting_id=m2.id, text="Schedule Acme team onboarding training webinar for Tuesday 10 AM EST", assignee_id=p2_alex.id, is_completed=False, source_segment_id=m2_segments[8].id),
        ])

        # ==========================================
        # Meeting 3: 1:1 with Jordan
        # ==========================================
        print("[SEED] Seeding Meeting 3: 1:1 with Jordan...")
        m3 = Meeting(
            title="1:1 with Jordan",
            date=now - datetime.timedelta(days=5, hours=1),
            duration_seconds=95,
            audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            owner_id=alex.id
        )
        db.add(m3)
        db.commit()

        p3_alex = Participant(meeting_id=m3.id, name="Alex Chen", avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", is_speaker=True)
        p3_jordan = Participant(meeting_id=m3.id, name="Jordan Taylor", avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", is_speaker=True)
        db.add_all([p3_alex, p3_jordan])
        db.commit()

        m3_segments_data = [
            (p3_alex.id, 0.0, 6.0, "Hey Jordan! Thanks for jumping on. How are you feeling about team workload this week?", 0),
            (p3_jordan.id, 6.4, 15.1, "Overall good Alex. The backend migrations are smooth, but I'd like to talk about technical debt in our query caching layer.", 1),
            (p3_alex.id, 15.5, 23.2, "I hear you. Where are you seeing the biggest bottlenecks right now?", 2),
            (p3_jordan.id, 23.6, 33.0, "When fetching full transcripts with 500+ segments, SQLAlchemy ORM serialization takes ~400ms without join optimization.", 3),
            (p3_alex.id, 33.4, 42.0, "That makes sense. If we use joinedload on speakers and participants, can we cut that down?", 4),
            (p3_jordan.id, 42.4, 51.2, "Definitely! I ran a quick benchmark and joinedload brings response latency down to 35ms.", 5),
            (p3_alex.id, 51.6, 59.0, "That's a 10x improvement! Let's prioritize that for this sprint refactor.", 6),
            (p3_jordan.id, 59.4, 68.1, "Also wanted to touch on career growth -- I'd like to lead the new AI assistant subagent architecture next quarter.", 7),
            (p3_alex.id, 68.5, 77.0, "You've earned it Jordan. Let's draft a Staff Engineer growth plan together next week.", 8),
            (p3_jordan.id, 77.4, 84.5, "Awesome, really appreciate the support Alex! Let's talk soon.", 9),
        ]

        m3_segments = []
        for s in m3_segments_data:
            seg = TranscriptSegment(meeting_id=m3.id, speaker_id=s[0], start_time=s[1], end_time=s[2], text=s[3], sequence_order=s[4])
            db.add(seg)
            m3_segments.append(seg)
        db.commit()

        db.add(Summary(
            meeting_id=m3.id,
            overview_text="Productive 1:1 discussing backend query optimizations and career development. Jordan identified an ORM join bottleneck in transcript serialization and demonstrated a 10x performance improvement using joinedload. Agreed on Jordan leading the upcoming AI architecture initiative.",
            source="mock"
        ))

        db.add_all([
            OutlineItem(meeting_id=m3.id, title="Workload & Status Check-in", start_time=0.0, sequence_order=0),
            OutlineItem(meeting_id=m3.id, title="SQLAlchemy Query Performance", start_time=15.5, sequence_order=1),
            OutlineItem(meeting_id=m3.id, title="Staff Engineer Career Growth Plan", start_time=59.4, sequence_order=2),
        ])

        db.add_all([
            ActionItem(meeting_id=m3.id, text="Apply joinedload optimization to transcript endpoints", assignee_id=p3_jordan.id, is_completed=True, source_segment_id=m3_segments[5].id),
            ActionItem(meeting_id=m3.id, text="Draft Staff Engineer promotion path document", assignee_id=p3_alex.id, is_completed=False, source_segment_id=m3_segments[8].id),
        ])

        # ==========================================
        # Meeting 4: Design Review — Mobile V2
        # ==========================================
        print("[SEED] Seeding Meeting 4: Design Review -- Mobile V2...")
        m4 = Meeting(
            title="Design Review — Mobile V2",
            date=now - datetime.timedelta(days=7, hours=4),
            duration_seconds=105,
            audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
            owner_id=alex.id
        )
        db.add(m4)
        db.commit()

        p4_alex = Participant(meeting_id=m4.id, name="Alex Chen", avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", is_speaker=True)
        p4_elena = Participant(meeting_id=m4.id, name="Elena Rostova", avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", is_speaker=True)
        p4_david = Participant(meeting_id=m4.id, name="David Kim", avatar_url="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", is_speaker=True)
        db.add_all([p4_alex, p4_elena, p4_david])
        db.commit()

        m4_segments_data = [
            (p4_alex.id, 0.0, 5.5, "Welcome to the Mobile V2 design review! Elena, show us the updated Figma specs.", 0),
            (p4_elena.id, 5.9, 14.2, "Thanks Alex! We overhauled the transcript detail view with custom design tokens -- warm neutral grays and deep teal primary accents.", 1),
            (p4_david.id, 14.6, 22.8, "The active segment highlight in dark mode looks super sleek! How are we handling speaker color coding?", 2),
            (p4_elena.id, 23.2, 31.5, "We hash the speaker's name deterministically to a fixed 6-color accessible palette so colors stay uniform.", 3),
            (p4_alex.id, 31.9, 40.2, "I love that. Deterministic hashing prevents random color shifts between pages.", 4),
            (p4_david.id, 40.6, 48.9, "On smaller viewports, we collapse the right panel into a bottom sheet drawer for smooth touch interaction.", 5),
            (p4_elena.id, 49.3, 58.0, "Exactly. We've also included skeleton loader animations that mirror real row card heights.", 6),
            (p4_alex.id, 58.4, 66.5, "Fantastic presentation Elena. David, when can frontend engineering start component implementation?", 7),
            (p4_david.id, 66.9, 74.0, "We can start building the reusable UI primitives tomorrow morning.", 8),
        ]

        m4_segments = []
        for s in m4_segments_data:
            seg = TranscriptSegment(meeting_id=m4.id, speaker_id=s[0], start_time=s[1], end_time=s[2], text=s[3], sequence_order=s[4])
            db.add(seg)
            m4_segments.append(seg)
        db.commit()

        db.add(Summary(
            meeting_id=m4.id,
            overview_text="Design review for EchoNotes Mobile V2 interface. Unanimous sign-off on custom design system tokens, deterministic speaker color hashing, and responsive bottom-sheet layouts for mobile viewports.",
            source="mock"
        ))

        db.add_all([
            OutlineItem(meeting_id=m4.id, title="Figma Component & Token Review", start_time=0.0, sequence_order=0),
            OutlineItem(meeting_id=m4.id, title="Deterministic Speaker Color Hashing", start_time=23.2, sequence_order=1),
            OutlineItem(meeting_id=m4.id, title="Responsive Mobile Layouts & Drawers", start_time=40.6, sequence_order=2),
        ])

        db.add_all([
            ActionItem(meeting_id=m4.id, text="Export Figma design token CSS variables for frontend team", assignee_id=p4_elena.id, is_completed=True, source_segment_id=m4_segments[1].id),
            ActionItem(meeting_id=m4.id, text="Implement deterministic string-hash to speaker color helper in TS", assignee_id=p4_david.id, is_completed=False, source_segment_id=m4_segments[3].id),
        ])

        # ==========================================
        # Meeting 5: All-Hands Q&A — Q2 Retrospective
        # ==========================================
        print("[SEED] Seeding Meeting 5: All-Hands Q&A -- Q2 Retrospective...")
        m5 = Meeting(
            title="All-Hands Q&A — Q2 Retrospective",
            date=now - datetime.timedelta(days=10, hours=3),
            duration_seconds=130,
            audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
            owner_id=alex.id
        )
        db.add(m5)
        db.commit()

        p5_alex = Participant(meeting_id=m5.id, name="Alex Chen", avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", is_speaker=True)
        p5_priya = Participant(meeting_id=m5.id, name="Priya Sharma", avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", is_speaker=True)
        p5_jordan = Participant(meeting_id=m5.id, name="Jordan Taylor", avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", is_speaker=True)
        db.add_all([p5_alex, p5_priya, p5_jordan])
        db.commit()

        m5_segments_data = [
            (p5_alex.id, 0.0, 7.0, "Welcome everyone to our Q2 Company All-Hands and Retrospective Q&A session!", 0),
            (p5_priya.id, 7.4, 16.0, "In Q2 we grew our active meeting intelligence volume by 140% month-over-month.", 1),
            (p5_jordan.id, 16.4, 25.0, "Engineering also achieved 99.95% API uptime while serving over 2 million transcript search queries.", 2),
            (p5_priya.id, 25.4, 34.0, "For Q3, our headline focus is delivering the 'Ask This Meeting' conversational assistant.", 3),
            (p5_alex.id, 34.4, 43.0, "That will let users ask natural language questions directly against any meeting transcript.", 4),
            (p5_jordan.id, 43.4, 52.0, "We're wrapping transcript context into LLM prompts with fast, streaming responses.", 5),
            (p5_priya.id, 52.4, 61.0, "Thank you to every team member for making Q2 an incredible milestone quarter!", 6),
        ]

        m5_segments = []
        for s in m5_segments_data:
            seg = TranscriptSegment(meeting_id=m5.id, speaker_id=s[0], start_time=s[1], end_time=s[2], text=s[3], sequence_order=s[4])
            db.add(seg)
            m5_segments.append(seg)
        db.commit()

        db.add(Summary(
            meeting_id=m5.id,
            overview_text="Q2 Retrospective & All-Hands meeting. Active meeting volume grew 140% MOM with 99.95% backend uptime. Headline initiative for Q3 is launching 'Ask This Meeting' natural language transcript Q&A.",
            source="mock"
        ))

        db.add_all([
            OutlineItem(meeting_id=m5.id, title="Q2 Retrospective Metrics & Growth", start_time=0.0, sequence_order=0),
            OutlineItem(meeting_id=m5.id, title="Engineering Infrastructure & Uptime", start_time=16.4, sequence_order=1),
            OutlineItem(meeting_id=m5.id, title="Q3 Product Strategy -- 'Ask This Meeting'", start_time=25.4, sequence_order=2),
        ])

        db.add_all([
            ActionItem(meeting_id=m5.id, text="Publish Q2 company growth retrospective report to team wiki", assignee_id=p5_priya.id, is_completed=True, source_segment_id=m5_segments[1].id),
            ActionItem(meeting_id=m5.id, text="Benchmark streaming latency for 'Ask This Meeting' endpoint", assignee_id=p5_jordan.id, is_completed=False, source_segment_id=m5_segments[5].id),
        ])

        print("[SEED] Seed script executed successfully! 5 rich meetings populated.")

    except Exception as e:
        db.rollback()
        print(f"[SEED ERROR] Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
