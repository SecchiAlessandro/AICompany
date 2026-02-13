"""Filesystem watcher using watchdog for real-time change detection."""
from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from typing import Callable, Coroutine, Any

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent

logger = logging.getLogger(__name__)


class _AsyncHandler(FileSystemEventHandler):
    """Bridge watchdog sync events to async callbacks."""

    def __init__(
        self,
        callback: Callable[[str, str], Coroutine[Any, Any, None]],
        loop: asyncio.AbstractEventLoop,
    ):
        self._callback = callback
        self._loop = loop

    def on_modified(self, event: FileSystemEvent) -> None:
        if not event.is_directory:
            asyncio.run_coroutine_threadsafe(
                self._callback("file_modified", event.src_path), self._loop
            )

    def on_created(self, event: FileSystemEvent) -> None:
        if not event.is_directory:
            asyncio.run_coroutine_threadsafe(
                self._callback("file_created", event.src_path), self._loop
            )

    def on_deleted(self, event: FileSystemEvent) -> None:
        if not event.is_directory:
            asyncio.run_coroutine_threadsafe(
                self._callback("file_deleted", event.src_path), self._loop
            )


class FileWatcher:
    """Watches directories for changes and dispatches async events."""

    def __init__(self) -> None:
        self._observer = Observer()
        self._running = False

    def watch(
        self,
        paths: list[Path],
        callback: Callable[[str, str], Coroutine[Any, Any, None]],
        loop: asyncio.AbstractEventLoop,
    ) -> None:
        handler = _AsyncHandler(callback, loop)
        for path in paths:
            if path.exists():
                self._observer.schedule(handler, str(path), recursive=True)
                logger.info("Watching: %s", path)
            elif path.parent.exists():
                self._observer.schedule(handler, str(path.parent), recursive=True)
                logger.info("Watching parent of: %s", path)

    def start(self) -> None:
        if not self._running:
            self._observer.start()
            self._running = True
            logger.info("File watcher started")

    def stop(self) -> None:
        if self._running:
            self._observer.stop()
            self._observer.join()
            self._running = False
            logger.info("File watcher stopped")
