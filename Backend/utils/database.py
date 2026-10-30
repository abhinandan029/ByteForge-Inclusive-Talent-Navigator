
import os
import time
import queue
import threading

from hdbcli import dbapi
from dotenv import load_dotenv

load_dotenv()

MAX_POOL_SIZE = 5

_pool = queue.LifoQueue(maxsize=MAX_POOL_SIZE)
_lock = threading.Lock()

_total_connections = 0
_all_connections = {}
_pool_closed = False


def _create_connection():
    start = time.perf_counter()

    conn = dbapi.connect(
        address=os.getenv("HANA_HOST"),
        port=int(os.getenv("HANA_PORT", 443)),
        user=os.getenv("HANA_USER"),
        password=os.getenv("HANA_PASSWORD"),
        encrypt=True,
        sslValidateCertificate=True,
        IPAddressFamily="IPv4First"
    )

    print(
        f"[DATABASE] New connection created in "
        f"{time.perf_counter() - start:.3f}s"
    )

    return conn


def initialize_pool():
    """Create one connection during application startup."""
    conn = get_connection()
    release_connection(conn)
    print("[DATABASE] Connection pool initialized")


def get_connection():
    global _total_connections

    if _pool_closed:
        raise RuntimeError("Database connection pool is closed")

    # Reuse an available connection first.
    try:
        return _pool.get_nowait()
    except queue.Empty:
        pass

    # Create a connection if the pool has room.
    with _lock:
        if _pool_closed:
            raise RuntimeError("Database connection pool is closed")

        if _total_connections < MAX_POOL_SIZE:
            _total_connections += 1
            create_new = True
        else:
            create_new = False

    if create_new:
        try:
            conn = _create_connection()

            with _lock:
                _all_connections[id(conn)] = conn

            return conn

        except Exception:
            with _lock:
                _total_connections -= 1
            raise

    # All connections are busy. Wait for one to be returned.
    try:
        return _pool.get(timeout=15)
    except queue.Empty:
        raise TimeoutError("No database connection available")


def release_connection(conn):
    """Return a connection to the pool instead of closing it."""

    if conn is None:
        return

    if _pool_closed:
        discard_connection(conn)
        return

    try:
        _pool.put_nowait(conn)
    except queue.Full:
        discard_connection(conn)


def discard_connection(conn):
    """Remove and close a connection that should not be reused."""
    global _total_connections

    if conn is None:
        return

    with _lock:
        existing = _all_connections.pop(id(conn), None)

        if existing is not None:
            _total_connections -= 1

    try:
        conn.close()
    except Exception:
        pass


def close_pool():
    """Close all connections when the application shuts down."""
    global _pool_closed, _total_connections

    with _lock:
        _pool_closed = True
        connections = list(_all_connections.values())
        _all_connections.clear()
        _total_connections = 0

    while True:
        try:
            _pool.get_nowait()
        except queue.Empty:
            break

    for conn in connections:
        try:
            conn.close()
        except Exception:
            pass

    print("[DATABASE] Connection pool closed")
